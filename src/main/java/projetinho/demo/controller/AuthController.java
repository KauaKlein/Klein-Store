package projetinho.demo.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import projetinho.demo.entity.Usuario;
import projetinho.demo.repository.UsuarioRepository;
import projetinho.demo.security.AuthHelper;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenBasedRememberMeServices rememberMeServices;
    private final AuthHelper authHelper;

    @Value("${spring.security.oauth2.client.registration.google.client-id:placeholder-client-id}")
    private String googleClientId;

    public AuthController(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager,
                          TokenBasedRememberMeServices rememberMeServices,
                          AuthHelper authHelper) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.rememberMeServices = rememberMeServices;
        this.authHelper = authHelper;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Usuario u = authHelper.getUsuarioLogado();
        return ResponseEntity.ok(toUserDto(u));
    }

    @GetMapping("/config")
    public Map<String, Object> config() {
        boolean googleEnabled = googleClientId != null
                && !googleClientId.isBlank()
                && !"placeholder-client-id".equals(googleClientId);
        return Map.of("googleEnabled", googleEnabled);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body,
                                   HttpServletRequest request,
                                   HttpServletResponse response) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String senha = body.getOrDefault("senha", "");

        if (email.isBlank() || senha.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Informe e-mail e senha."));
        }

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, senha)
            );
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);
            request.getSession(true).setAttribute(
                    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context
            );
            rememberMeServices.loginSuccess(request, response, auth);

            Usuario u = usuarioRepository.findByEmailIgnoreCase(email).orElseThrow();
            return ResponseEntity.ok(toUserDto(u));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", "E-mail ou senha inválidos."));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body,
                                      HttpServletRequest request,
                                      HttpServletResponse response) {
        String nome = body.getOrDefault("nome", "").trim();
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String senha = body.getOrDefault("senha", "");

        if (nome.isBlank() || email.isBlank() || senha.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erro", "Preencha nome, e-mail válido e senha com no mínimo 6 caracteres."));
        }

        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("erro", "Já existe uma conta cadastrada com este e-mail."));
        }

        Usuario novo = new Usuario();
        novo.setNome(nome);
        novo.setEmail(email);
        novo.setSenha(passwordEncoder.encode(senha));
        novo.setProvider("LOCAL");
        usuarioRepository.save(novo);

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, senha)
        );
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        request.getSession(true).setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context
        );
        rememberMeServices.loginSuccess(request, response, auth);

        return ResponseEntity.status(HttpStatus.CREATED).body(toUserDto(novo));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        rememberMeServices.logout(request, response, auth);
        if (request.getSession(false) != null) {
            request.getSession(false).invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private Map<String, Object> toUserDto(Usuario u) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", u.getId());
        dto.put("nome", u.getNome());
        dto.put("email", u.getEmail());
        dto.put("fotoUrl", u.getFotoUrl() != null ? u.getFotoUrl() : "");
        dto.put("provider", u.getProvider() != null ? u.getProvider() : "LOCAL");
        return dto;
    }
}
