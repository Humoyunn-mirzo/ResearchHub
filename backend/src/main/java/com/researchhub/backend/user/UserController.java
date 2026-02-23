package com.researchhub.backend.user;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public String registerUser(@RequestBody RegisterRequest req) {
        userService.registerUser(req.getEmail(), req.getPassword(), req.getRole());
        return "Successfully created user";
    }

    @PostMapping("/register-developer")
    public String registerDeveloper(@RequestBody RegisterDeveloperRequest req) {
        userService.registerDeveloper(req.getEmail(), req.getPassword());
        return "Successfully created developer user";
    }
}

