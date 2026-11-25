package projetinho.demo.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices;
import projetinho.demo.entity.Usuario;
import projetinho.demo.repository.UsuarioRepository;

import java.util.UUID;

@Configuration
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final UsuarioRepository usuarioRepository;

    @Value("${app.remember-me.key:klein-store-persistent-secret-2026}")
    private String rememberMeKey;

    public SecurityConfig(CustomUserDetailsService userDetailsService, UsuarioRepository usuarioRepository) {
        this.userDetailsService = userDetailsService;
        this.usuarioRepository = usuarioRepository;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public TokenBasedRememberMeServices rememberMeServices() {
        TokenBasedRememberMeServices services = new TokenBasedRememberMeServices(rememberMeKey, userDetailsService);
        services.setCookieName("klein_remember_me");
        services.setAlwaysRemember(true);
        services.setTokenValiditySeconds(60 * 60 * 24 * 365); // 1 ano logado
        return services;
    }

    @Bean
    public AuthenticationSuccessHandler oauth2SuccessHandler(PasswordEncoder passwordEncoder,
                                                             TokenBasedRememberMeServices rememberMeServices) {
        return (request, response, authentication) -> {
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
            String email = oauthUser.getAttribute("email");
            String nome = oauthUser.getAttribute("name");
            String foto = oauthUser.getAttribute("picture");

            if (email == null || email.isBlank()) {
                response.sendRedirect("/?authError=email");
                return;
            }

            Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
                Usuario novo = new Usuario();
                novo.setEmail(email.toLowerCase());
                novo.setNome((nome != null && !nome.isBlank()) ? nome : email.split("@")[0]);
                novo.setSenha(passwordEncoder.encode(UUID.randomUUID().toString()));
                novo.setProvider("GOOGLE");
                return novo;
            });

            if (foto != null && !foto.isBlank()) {
                usuario.setFotoUrl(foto);
            }
            if ((usuario.getNome() == null || usuario.getNome().isBlank()) && nome != null) {
                usuario.setNome(nome);
            }
            usuarioRepository.save(usuario);

            // Converte para autenticação padrão e grava cookie persistente de 1 ano
            UserDetails details = userDetailsService.loadUserByUsername(usuario.getEmail());
            Authentication localAuth = new UsernamePasswordAuthenticationToken(
                    details, null, details.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(localAuth);
            request.getSession(true).setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
            rememberMeServices.loginSuccess(request, response, localAuth);

            response.sendRedirect("/");
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           PasswordEncoder passwordEncoder,
                                           TokenBasedRememberMeServices rememberMeServices) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/", "/index.html", "/styles.css", "/app.js", "/favicon.ico",
                    "/api/auth/**", "/oauth2/**", "/login/**", "/error", "/h2-console/**"
                ).permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"erro\":\"Não autenticado\"}");
                })
            )
            .rememberMe(rm -> rm
                .rememberMeServices(rememberMeServices)
                .key(rememberMeKey)
            )
            .oauth2Login(oauth -> oauth
                .successHandler(oauth2SuccessHandler(passwordEncoder, rememberMeServices))
                .failureUrl("/?authError=google")
            );

        return http.build();
    }
}
