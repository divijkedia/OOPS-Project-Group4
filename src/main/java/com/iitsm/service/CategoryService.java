package com.iitsm.service;

import com.iitsm.domain.exception.CategoryNotFoundException;
import com.iitsm.domain.exception.ResourceAlreadyExistsException;
import com.iitsm.domain.model.IncidentCategory;
import com.iitsm.repository.IncidentCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service managing data-driven Incident Categories and auto-classification keyword rules.
 */
@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final IncidentCategoryRepository categoryRepository;

    public CategoryService(IncidentCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<IncidentCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public IncidentCategory getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException(id));
    }

    public Optional<IncidentCategory> findByName(String name) {
        return categoryRepository.findByName(name);
    }

    /**
     * Auto-suggests an incident category by evaluating incident title and description
     * against configured category keyword tokens.
     *
     * @param text combined title and description text
     * @return matching IncidentCategory if found, otherwise empty
     */
    public Optional<IncidentCategory> suggestCategory(String text) {
        if (text == null || text.isBlank()) {
            return Optional.empty();
        }
        String lower = text.toLowerCase();
        List<IncidentCategory> categories = categoryRepository.findAll();

        IncidentCategory bestCategory = null;
        long maxMatches = 0;

        for (IncidentCategory category : categories) {
            long matches = category.getKeywordTokens().stream()
                    .filter(lower::contains)
                    .count();
            if (matches > maxMatches) {
                maxMatches = matches;
                bestCategory = category;
            }
        }
        return Optional.ofNullable(bestCategory);
    }

    @Transactional
    public IncidentCategory createCategory(String name, String description, String keywords) {
        if (categoryRepository.existsByName(name)) {
            throw new ResourceAlreadyExistsException(String.format("Category with name '%s' already exists", name));
        }
        IncidentCategory category = new IncidentCategory(name, description, keywords);
        return categoryRepository.save(category);
    }

    @Transactional
    public IncidentCategory updateCategory(Long id, String name, String description, String keywords) {
        IncidentCategory category = getCategoryById(id);
        if (!category.getName().equalsIgnoreCase(name) && categoryRepository.existsByName(name)) {
            throw new ResourceAlreadyExistsException(String.format("Category with name '%s' already exists", name));
        }
        category.setName(name);
        category.setDescription(description);
        category.setKeywords(keywords);
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new CategoryNotFoundException(id);
        }
        categoryRepository.deleteById(id);
    }
}
