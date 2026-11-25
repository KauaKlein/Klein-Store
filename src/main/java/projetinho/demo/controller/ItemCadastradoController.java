package projetinho.demo.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import projetinho.demo.entity.ItemCadastrado;
import projetinho.demo.service.ItemCadastradoService;

import java.util.List;

@RestController
@RequestMapping("/api/jogos")
public class ItemCadastradoController {

    @Autowired
    ItemCadastradoService itemCadastradoService;

    @GetMapping
    public List<ItemCadastrado> listarTodos() {
        return itemCadastradoService.listarTodos();
    }

    @PostMapping
    public ItemCadastrado salvar(@RequestBody ItemCadastrado item) {
        return itemCadastradoService.salvar(item);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        itemCadastradoService.deletar(id);
    }

    @PutMapping("/{id}")
    public ItemCadastrado atualizar(@PathVariable Long id, @RequestBody ItemCadastrado novosDados) {
        return itemCadastradoService.atualizar(id, novosDados);
    }
}
