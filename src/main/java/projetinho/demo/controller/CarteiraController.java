package projetinho.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import projetinho.demo.entity.Carteira;
import projetinho.demo.security.AuthHelper;
import projetinho.demo.service.CarteiraService;

import java.util.List;

@RestController
@RequestMapping("/api/financas")
public class CarteiraController {

    @Autowired
    CarteiraService carteiraService;

    @Autowired
    AuthHelper authHelper;

    @GetMapping
    public List<Carteira> listarTodos() {
        return carteiraService.listarTodos(authHelper.getUsuarioLogado().getId());
    }

    @PostMapping
    public Carteira salvar(@RequestBody Carteira carteira) {
        return carteiraService.salvar(carteira, authHelper.getUsuarioLogado().getId());
    }

    @PutMapping("/{id}")
    public Carteira atualizar(@PathVariable Long id, @RequestBody Carteira novosDados) {
        return carteiraService.atualizar(id, novosDados, authHelper.getUsuarioLogado().getId());
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        carteiraService.deletar(id, authHelper.getUsuarioLogado().getId());
    }
}
