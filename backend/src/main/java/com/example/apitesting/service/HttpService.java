package com.example.apitesting.service;

import com.example.apitesting.model.RequestData;
import com.example.apitesting.model.ResponseData;
import org.springframework.stereotype.Service;

@Service
public class HttpService {

    public ResponseData handleGet(String param) {
        return new ResponseData("success", "GET param: " + param);
    }

    public ResponseData handlePost(RequestData request) {
        return new ResponseData("success", "POST value: " + request.getValue());
    }

    public ResponseData handlePut(RequestData request) {
        return new ResponseData("success", "PUT value: " + request.getValue());
    }

    public ResponseData handlePatch(RequestData request) {
        return new ResponseData("success", "PATCH value: " + request.getValue());
    }

    public String handleDelete(String id) {
        return "Deleted ID: " + id;
    }
}
