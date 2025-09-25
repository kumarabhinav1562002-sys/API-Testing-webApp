package com.example.apitesting.controller;

import com.example.apitesting.service.HttpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/http")
public class HttpController {

    private final HttpService httpService;

    public HttpController(HttpService httpService) {
        this.httpService = httpService;
    }

    @GetMapping("/get")
    public ResponseEntity<ResponseData> getExample(@RequestParam String param) {
        return ResponseEntity.ok(httpService.handleGet(param));
    }

    @PostMapping("/post")
    public ResponseEntity<ResponseData> postExample(@RequestBody RequestData request) {
        return ResponseEntity.ok(httpService.handlePost(request));
    }

    @PutMapping("/put")
    public ResponseEntity<ResponseData> putExample(@RequestBody RequestData request) {
        return ResponseEntity.ok(httpService.handlePut(request));
    }

    @PatchMapping("/patch")
    public ResponseEntity<ResponseData> patchExample(@RequestBody RequestData request) {
        return ResponseEntity.ok(httpService.handlePatch(request));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteExample(@RequestParam String id) {
        return ResponseEntity.ok(httpService.handleDelete(id));
    }
}
