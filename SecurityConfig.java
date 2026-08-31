package com.mcdr.settlement.security;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
@Configuration @EnableMethodSecurity
public class SecurityConfig {
 @Bean SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
  http.csrf(c->c.disable()).authorizeHttpRequests(a->a.requestMatchers("/h2-console/**").permitAll().anyRequest().authenticated())
   .headers(h->h.frameOptions(f->f.sameOrigin()))
   .addFilterBefore(new DemoAuthFilter(), UsernamePasswordAuthenticationFilter.class);
  return http.build();
 }
}
