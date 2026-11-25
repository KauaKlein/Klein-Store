package projetinho.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mercado")
public class MercadoController {

    private static final String RSS_URL =
            "https://news.google.com/rss/search?q=ibovespa+OR+dolar+OR+bitcoin+mercado+financeiro&hl=pt-BR&gl=BR&ceid=BR:pt-419";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    private List<Map<String, String>> cacheNoticias = List.of();
    private Instant cacheExpiraEm = Instant.EPOCH;

    @GetMapping("/noticias")
    public synchronized List<Map<String, String>> listarNoticias() {
        if (!cacheNoticias.isEmpty() && Instant.now().isBefore(cacheExpiraEm)) {
            return cacheNoticias;
        }

        List<Map<String, String>> resultado = new ArrayList<>();
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(RSS_URL))
                    .timeout(Duration.ofSeconds(10))
                    .header("User-Agent", "Mozilla/5.0 (KleinStore)")
                    .GET()
                    .build();

            HttpResponse<InputStream> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofInputStream());
            if (resp.statusCode() == 200) {
                DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
                Document doc = factory.newDocumentBuilder().parse(resp.body());
                NodeList items = doc.getElementsByTagName("item");

                int limite = Math.min(items.getLength(), 10);
                for (int i = 0; i < limite; i++) {
                    Element el = (Element) items.item(i);
                    String tituloBruto = getTagText(el, "title");
                    String link = getTagText(el, "link");
                    String pubDate = getTagText(el, "pubDate");
                    String fonte = getTagText(el, "source");

                    String titulo = tituloBruto;
                    if (!fonte.isBlank() && tituloBruto.endsWith(" - " + fonte)) {
                        titulo = tituloBruto.substring(0, tituloBruto.length() - (" - " + fonte).length());
                    } else if (fonte.isBlank() && tituloBruto.contains(" - ")) {
                        int idx = tituloBruto.lastIndexOf(" - ");
                        fonte = tituloBruto.substring(idx + 3);
                        titulo = tituloBruto.substring(0, idx);
                    }

                    Map<String, String> noticia = new LinkedHashMap<>();
                    noticia.put("titulo", titulo.trim());
                    noticia.put("fonte", fonte.isBlank() ? "Mercado" : fonte.trim());
                    noticia.put("link", link.trim());
                    noticia.put("data", pubDate.trim());
                    resultado.add(noticia);
                }

                if (!resultado.isEmpty()) {
                    cacheNoticias = resultado;
                    cacheExpiraEm = Instant.now().plus(Duration.ofMinutes(5));
                }
            }
        } catch (Exception ignored) {
            // Retorna cache anterior se disponível
        }

        return !resultado.isEmpty() ? resultado : cacheNoticias;
    }

    private String getTagText(Element parent, String tag) {
        NodeList list = parent.getElementsByTagName(tag);
        if (list.getLength() == 0 || list.item(0) == null) {
            return "";
        }
        return list.item(0).getTextContent() != null ? list.item(0).getTextContent() : "";
    }
}
