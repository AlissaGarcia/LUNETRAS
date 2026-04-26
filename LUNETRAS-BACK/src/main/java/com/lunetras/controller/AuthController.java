package com.lunetras.controller;

import com.lunetras.dto.LoginRequest;
import com.lunetras.dto.LoginResponse;
import com.lunetras.model.Usuario;
import com.lunetras.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

     private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    
    public AuthController(AuthenticationManager authenticationManager, 
                          JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        }

       @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
        );
        
        Usuario usuario = (Usuario) authentication.getPrincipal();
        
        if (!usuario.isEnabled()) {
            throw new IllegalArgumentException("Usuário desativado");
        }
        
        String token = jwtService.generateToken(usuario);
        
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setNome(usuario.getNome());
        response.setPerfil(usuario.getPerfil().name());
        response.setId(usuario.getId());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/me")
    public ResponseEntity<LoginResponse> me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Usuario usuario)) {
            return ResponseEntity.status(401).build();
        }
        
        LoginResponse response = new LoginResponse();
        response.setNome(usuario.getNome());
        response.setPerfil(usuario.getPerfil().name());
        response.setId(usuario.getId());
        
        return ResponseEntity.ok(response);
    }
}
