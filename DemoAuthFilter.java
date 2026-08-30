package com.mcdr.settlement.security;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import java.io.IOException;
import java.util.List;
public class DemoAuthFilter extends jakarta.servlet.http.OncePerRequestFilter {
 protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
  String h=req.getHeader("Authorization");
  if(h!=null && h.startsWith("Bearer ")){
   String token=h.substring(7);
   String role=null,user=null;
   if(token.equals("backoffice-token")){role="ROLE_BACKOFFICE_EMPLOYEE";user="backoffice@mcdr.local";}
   else if(token.equals("owner-token")){role="ROLE_OWNER";user="owner@mcdr.local";}
   if(role!=null) SecurityContextHolder.getContext().setAuthentication(
    new UsernamePasswordAuthenticationToken(user,null,List.of(new SimpleGrantedAuthority(role))));
  }
  chain.doFilter(req,res);
 }
}
