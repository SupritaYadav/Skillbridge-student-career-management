
package com.skillbridge.config;

import java.util.Arrays;

import com.skillbridge.services.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175"
        ));

        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtService jwtService,
            CorsConfigurationSource corsConfigurationSource
    ) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, ex) ->
                    response.setStatus(401))
                .accessDeniedHandler((request, response, ex) ->
                    response.setStatus(403))
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.POST, "/api/resources/**")
                    .hasAnyRole("FACULTY", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/resources/**")
                    .hasAnyRole("FACULTY", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/resources/**")
                    .hasAnyRole("FACULTY", "ADMIN")

                .requestMatchers(HttpMethod.POST, "/api/opportunities/**")
                    .hasAnyRole("FACULTY", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/opportunities/**")
                    .hasAnyRole("FACULTY", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/opportunities/**")
                    .hasAnyRole("FACULTY", "ADMIN")

                .anyRequest().authenticated()
            )
            .addFilterBefore(
                new JwtAuthenticationFilter(jwtService),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
