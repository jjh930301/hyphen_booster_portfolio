package com.booster.hyphen.nice;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.http.converter.json.GsonHttpMessageConverter;
import org.springframework.util.StringUtils;

import com.google.gson.*;

import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.ApiKey;
import springfox.documentation.service.AuthorizationScope;
import springfox.documentation.service.SecurityReference;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spi.service.contexts.SecurityContext;
import springfox.documentation.spring.web.json.Json;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import org.springframework.boot.actuate.autoconfigure.endpoint.web.CorsEndpointProperties;
import org.springframework.boot.actuate.autoconfigure.endpoint.web.WebEndpointProperties;
import org.springframework.boot.actuate.autoconfigure.web.server.ManagementPortType;
import org.springframework.boot.actuate.endpoint.ExposableEndpoint;
import org.springframework.boot.actuate.endpoint.web.EndpointLinksResolver;
import org.springframework.boot.actuate.endpoint.web.EndpointMapping;
import org.springframework.boot.actuate.endpoint.web.EndpointMediaTypes;
import org.springframework.boot.actuate.endpoint.web.ExposableWebEndpoint;
import org.springframework.boot.actuate.endpoint.web.WebEndpointsSupplier;
import org.springframework.boot.actuate.endpoint.web.annotation.ControllerEndpointsSupplier;
import org.springframework.boot.actuate.endpoint.web.annotation.ServletEndpointsSupplier;
import org.springframework.boot.actuate.endpoint.web.servlet.WebMvcEndpointHandlerMapping;

@Profile("!production")
@Configuration
@EnableSwagger2
public class SetupSwagger {
  @Bean
  public Docket restAPI() {
    return new Docket(DocumentationType.SWAGGER_2)
      .apiInfo(apiInfo())
      .securityContexts(Arrays.asList(securityContext()))
      .securitySchemes(Arrays.asList(apiKey()))
      .select()
      .apis(RequestHandlerSelectors.basePackage("com.booster.hyphen.nice.controllers"))
      .paths(PathSelectors.any())
      .build();
  }

  private ApiInfo apiInfo() {
    return new ApiInfoBuilder()
      .title("nice정보통신 api docs")
      .version("1.0.0")
      .description("나이스정보통신 회원가입 api")
      .build();
  }
  //for swagger path
  @Bean
  public GsonHttpMessageConverter gsonHttpMessageConverter() {
    GsonHttpMessageConverter converter = new GsonHttpMessageConverter();
    converter.setGson(gson());
    return converter;
  }

  private ApiKey apiKey() {
    return new ApiKey("JWT", "Authorization", "header");
  }

  private SecurityContext securityContext() {
      return SecurityContext.builder()
          .securityReferences(defaultAuth())
          .forPaths(PathSelectors.regex("/user"))
          .build();
  }

  List<SecurityReference> defaultAuth() {
      AuthorizationScope authorizationScope
          = new AuthorizationScope("global", "accessEverything");
      AuthorizationScope[] authorizationScopes = new AuthorizationScope[1];
      authorizationScopes[0] = authorizationScope;
      return Arrays.asList(new SecurityReference("JWT", authorizationScopes));
  }

  private Gson gson() {
    final GsonBuilder builder = new GsonBuilder();
    builder.registerTypeAdapter(Json.class, new SpringfoxJsonToGsonAdapter());
    return builder.create();
  }

  public class SpringfoxJsonToGsonAdapter implements JsonSerializer<Json> {

    @Override
    public JsonElement serialize(Json json, Type typeOfSrc, JsonSerializationContext context) {
      return JsonParser.parseString(json.value());
    } 
  }
  // for health checker
  @Bean
  public WebMvcEndpointHandlerMapping webEndpointServletHandlerMapping(
    WebEndpointsSupplier webEndpointsSupplier,
    ServletEndpointsSupplier servletEndpointsSupplier, 
    ControllerEndpointsSupplier controllerEndpointsSupplier,
    EndpointMediaTypes endpointMediaTypes, 
    CorsEndpointProperties corsProperties,
    WebEndpointProperties webEndpointProperties, 
    Environment environment
  ) {
    List<ExposableEndpoint<?>> allEndpoints = new ArrayList<>();
    Collection<ExposableWebEndpoint> webEndpoints = webEndpointsSupplier.getEndpoints();
    allEndpoints.addAll(webEndpoints);
    allEndpoints.addAll(servletEndpointsSupplier.getEndpoints());
    allEndpoints.addAll(controllerEndpointsSupplier.getEndpoints());
    String basePath = webEndpointProperties.getBasePath();
    EndpointMapping endpointMapping = new EndpointMapping(basePath);
    boolean shouldRegisterLinksMapping =
    webEndpointProperties.getDiscovery().isEnabled() && (StringUtils.hasText(basePath)
    || ManagementPortType.get(environment).equals(ManagementPortType.DIFFERENT));
    return new WebMvcEndpointHandlerMapping(
      endpointMapping, 
      webEndpoints, 
      endpointMediaTypes,
      corsProperties.toCorsConfiguration(), 
      new EndpointLinksResolver(allEndpoints, basePath),
      shouldRegisterLinksMapping, null
    );
  }
}
