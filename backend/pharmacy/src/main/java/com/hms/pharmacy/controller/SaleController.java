package com.hms.pharmacy.controller;

import com.hms.pharmacy.dto.ResponseDto;
import com.hms.pharmacy.dto.SaleDto;
import com.hms.pharmacy.dto.SaleItemDto;
import com.hms.pharmacy.exception.HmsException;
import com.hms.pharmacy.service.SaleItemService;
import com.hms.pharmacy.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequiredArgsConstructor
@RequestMapping("pharmacy/sales")
public class SaleController {

    private final SaleService saleService;
    private final SaleItemService saleItemService;

    @PostMapping("/create")
    public ResponseEntity<SaleDto> createSale(@RequestBody SaleDto dto) throws HmsException {
        return new ResponseEntity<>(saleService.createSale(dto),HttpStatus.CREATED);
    }

    @GetMapping("/getSaleitems/{saleId}")
    public ResponseEntity<List<SaleItemDto>> getSaleItems(@PathVariable Long saleId) throws HmsException {
        List<SaleItemDto> saleItems = saleItemService.getSaleItemsBySaleId(saleId);
        return new ResponseEntity<>(saleItems, HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<SaleDto> getSaleById(@PathVariable Long id) throws HmsException {
        return new ResponseEntity<>(saleService.getSaleById(id), HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<ResponseDto> updateSale(@RequestBody SaleDto dto) throws HmsException {
        saleService.updateSale(dto);
        return new ResponseEntity<>(new ResponseDto("Sale updated successfully"), HttpStatus.OK);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<SaleDto>> getAllSales() throws HmsException {
        return new ResponseEntity<>(saleService.getAllSales(), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseDto> deleteSale(@PathVariable Long id) throws HmsException {
        saleService.deleteSale(id);
        return new ResponseEntity<>(new ResponseDto("Sale deleted successfully"), HttpStatus.OK);
    }

}
