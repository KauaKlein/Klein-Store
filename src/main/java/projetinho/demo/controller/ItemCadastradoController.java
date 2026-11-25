package projetinho.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import projetinho.demo.entity.ItemCadastrado;
import projetinho.demo.security.AuthHelper;
import projetinho.demo.service.ItemCadastradoService;

import java.util.List;

@RestController
@RequestMapping("/api/jogos")
public class ItemCadastradoController {

    @Autowired
    ItemCadastradoService itemCadastradoService;

    @Autowired
    AuthHelper authHelper;

    @GetMapping
    public List<ItemCadastrado> listarTodos() {
        return itemCadastradoService.listarTodos(authHelper.getUsuarioLogado().getId());
    }

    @PostMapping
    public ItemCadastrado salvar(@RequestBody ItemCadastrado item) {
        return itemCadastradoService.salvar(item, authHelper.getUsuarioLogado().getId());
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        itemCadastradoService.deletar(id, authHelper.getUsuarioLogado().getId());
    }

    @PutMapping("/{id}")
    public ItemCadastrado atualizar(@PathVariable Long id, @RequestBody ItemCadastrado novosDados) {
        return itemCadastradoService.atualizar(id, novosDados, authHelper.getUsuarioLogado().getId());
    }
}
