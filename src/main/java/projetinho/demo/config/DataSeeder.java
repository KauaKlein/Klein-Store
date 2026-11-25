package projetinho.demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import projetinho.demo.entity.Carteira;
import projetinho.demo.entity.ItemCadastrado;
import projetinho.demo.entity.Usuario;
import projetinho.demo.repository.CarteiraRepository;
import projetinho.demo.repository.ItemCadastradoRepository;
import projetinho.demo.repository.UsuarioRepository;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final String OWNER_EMAIL = "kaua1floripa@gmail.com";
    private static final String OWNER_NAME = "Kauã Klein";
    private static final String OWNER_INITIAL_PASS = "KJ14floripa!";

    private final ItemCadastradoRepository itemRepository;
    private final CarteiraRepository carteiraRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(ItemCadastradoRepository itemRepository,
                      CarteiraRepository carteiraRepository,
                      UsuarioRepository usuarioRepository,
                      PasswordEncoder passwordEncoder) {
        this.itemRepository = itemRepository;
        this.carteiraRepository = carteiraRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Garante a conta principal do Kauã
        Usuario owner = usuarioRepository.findByEmailIgnoreCase(OWNER_EMAIL).orElseGet(() -> {
            Usuario novo = new Usuario();
            novo.setEmail(OWNER_EMAIL);
            novo.setNome(OWNER_NAME);
            novo.setSenha(passwordEncoder.encode(OWNER_INITIAL_PASS));
            novo.setProvider("LOCAL");
            return usuarioRepository.save(novo);
        });

        // 2. Vincula todos os jogos e finanças antigos (usuarioId == null) à conta do Kauã
        List<ItemCadastrado> jogosSemDono = itemRepository.findByUsuarioIdIsNull();
        if (!jogosSemDono.isEmpty()) {
            jogosSemDono.forEach(j -> j.setUsuarioId(owner.getId()));
            itemRepository.saveAll(jogosSemDono);
            System.out.println(">>> " + jogosSemDono.size() + " jogos vinculados à conta " + OWNER_EMAIL);
        }

        List<Carteira> financasSemDono = carteiraRepository.findByUsuarioIdIsNull();
        if (!financasSemDono.isEmpty()) {
            financasSemDono.forEach(f -> f.setUsuarioId(owner.getId()));
            carteiraRepository.saveAll(financasSemDono);
            System.out.println(">>> " + financasSemDono.size() + " lançamentos vinculados à conta " + OWNER_EMAIL);
        }

        // 3. Importa seed-jogos.csv na conta do Kauã se ainda não existir nenhum jogo no banco
        ClassPathResource resource = new ClassPathResource("seed-jogos.csv");
        if (!resource.exists()) {
            return;
        }

        List<ItemCadastrado> itensCsv = new ArrayList<>();
        Map<String, String> capasPorNome = new HashMap<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

            String linha = reader.readLine(); // pula o cabeçalho
            while ((linha = reader.readLine()) != null) {
                if (linha.isBlank()) {
                    continue;
                }
                String[] partes = linha.split(";", 6);
                if (partes.length < 5) {
                    continue;
                }

                String nome = partes[1].trim();
                String img = partes.length >= 6 ? partes[5].trim() : "";

                if (!img.isBlank()) {
                    capasPorNome.putIfAbsent(nome.toLowerCase(), img);
                }

                ItemCadastrado item = new ItemCadastrado();
                item.setIdLote(Long.parseLong(partes[0].trim()));
                item.setNome(nome);
                item.setValorPago(Double.parseDouble(partes[2].trim()));
                item.setValorVenda(partes[3].isBlank() ? null : Double.parseDouble(partes[3].trim()));
                item.setStatus(Boolean.parseBoolean(partes[4].trim()));
                item.setImg(img);
                item.setUsuarioId(owner.getId());

                itensCsv.add(item);
            }
        }

        if (itemRepository.count() == 0) {
            itemRepository.saveAll(itensCsv);
            System.out.println(">>> Planilha importada para " + OWNER_EMAIL + ": " + itensCsv.size() + " itens.");
            return;
        }

        // Backfill de capas caso algum item do dono ainda esteja sem img
        List<ItemCadastrado> existentes = itemRepository.findByUsuarioId(owner.getId());
        List<ItemCadastrado> paraAtualizar = new ArrayList<>();
        for (ItemCadastrado item : existentes) {
            if (item.getImg() == null || item.getImg().isBlank()) {
                String capa = capasPorNome.get(item.getNome() == null ? "" : item.getNome().trim().toLowerCase());
                if (capa != null && !capa.isBlank()) {
                    item.setImg(capa);
                    paraAtualizar.add(item);
                }
            }
        }
        if (!paraAtualizar.isEmpty()) {
            itemRepository.saveAll(paraAtualizar);
        }
    }
}
