package controller;

import com.lunetras.dto.LoginRequest;
import com.lunetras.dto.LoginResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @PostMapping("/auth/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        // Simulação de autenticação (mock)
        LoginResponse response = new LoginResponse();
        response.setNome("Professor Teste");
        response.setPerfil("PROFESSOR");
        response.setToken("token-fake-lunetras");

        return response;
    }
}