package projetinho.demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import projetinho.demo.entity.ItemCadastrado;
import projetinho.demo.repository.ItemCadastradoRepository;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ItemCadastradoRepository repository;

    public DataSeeder(ItemCadastradoRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) throws Exception {
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

                itensCsv.add(item);
            }
        }

        if (repository.count() == 0) {
            repository.saveAll(itensCsv);
            System.out.println(">>> Planilha importada com sucesso: " + itensCsv.size() + " itens cadastrados com capas.");
            return;
        }

        // Se o banco já estava populado sem capas, preenche automaticamente os itens com img vazia
        List<ItemCadastrado> existentes = repository.findAll();
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
            repository.saveAll(paraAtualizar);
            System.out.println(">>> Capas atualizadas automaticamente em " + paraAtualizar.size() + " itens.");
        }
    }
}
