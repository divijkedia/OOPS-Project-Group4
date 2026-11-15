package com.iitsm.service;

import com.iitsm.domain.enums.BusinessCriticality;
import com.iitsm.domain.exception.ResourceAlreadyExistsException;
import com.iitsm.domain.exception.ServiceNotFoundException;
import com.iitsm.domain.model.ItService;
import com.iitsm.repository.ItServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service managing the enterprise IT Service catalog.
 */
@Service
@Transactional(readOnly = true)
public class ItServiceService {

    private final ItServiceRepository itServiceRepository;

    public ItServiceService(ItServiceRepository itServiceRepository) {
        this.itServiceRepository = itServiceRepository;
    }

    public List<ItService> getAllServices() {
        return itServiceRepository.findAll();
    }

    public List<ItService> getActiveServices() {
        return itServiceRepository.findByActiveTrue();
    }

    public ItService getServiceById(Long id) {
        return itServiceRepository.findById(id)
                .orElseThrow(() -> new ServiceNotFoundException(id));
    }

    @Transactional
    public ItService createService(String name, String description, BusinessCriticality criticality) {
        if (itServiceRepository.existsByName(name)) {
            throw new ResourceAlreadyExistsException(String.format("IT Service with name '%s' already exists", name));
        }
        ItService service = new ItService(name, description, criticality);
        return itServiceRepository.save(service);
    }

    @Transactional
    public ItService updateService(Long id, String name, String description,
                                   BusinessCriticality criticality, boolean active) {
        ItService service = getServiceById(id);
        if (!service.getName().equalsIgnoreCase(name) && itServiceRepository.existsByName(name)) {
            throw new ResourceAlreadyExistsException(String.format("IT Service with name '%s' already exists", name));
        }
        service.setName(name);
        service.setDescription(description);
        service.setBusinessCriticality(criticality);
        service.setActive(active);
        return itServiceRepository.save(service);
    }

    @Transactional
    public void deleteService(Long id) {
        if (!itServiceRepository.existsById(id)) {
            throw new ServiceNotFoundException(id);
        }
        itServiceRepository.deleteById(id);
    }
}
