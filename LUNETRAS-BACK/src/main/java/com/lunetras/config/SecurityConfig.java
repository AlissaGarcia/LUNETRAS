package com.lunetras.config;

import com.lunetras.service.UsuarioDetailsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final UsuarioDetailsService usuarioDetailsService;

    @Value("${APP_CORS_ALLOWED_ORIGINS:http://localhost:5173}")
    private String corsAllowedOrigins;

    public SecurityConfig(UsuarioDetailsService usuarioDetailsService) {
        this.usuarioDetailsService = usuarioDetailsService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .anyRequest().authenticated())
                .userDetailsService(usuarioDetailsService)
                .formLogin(form -> form
                        .loginProcessingUrl("/auth/login")
                        .successHandler((request, response, authentication) -> {
                            // Return JSON success instead of redirect
                            response.setContentType("application/json");
                            response.getWriter().write("{\"success\": true}");
                            response.setStatus(200);
                        })
                        .failureHandler((request, response, exception) -> {
                            // Return JSON error instead of redirect
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Login failed\"}");
                            response.setStatus(401);
                        })
                        .permitAll())
                .logout(logout -> logout
                        .logoutUrl("/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            // Return JSON success instead of redirect
                            response.setContentType("application/json");
                            response.getWriter().write("{\"success\": true}");
                            response.setStatus(200);
                        })
                        .permitAll());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(corsAllowedOrigins.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}