package com.skillbridge.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity 
@Table(name = "projects")

public class Project{
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private String technologies;
    private String link;
    
    public Project(){

    }
    public Long getId(){
        return id;
    }
    public String getTitle(){
        return title;
    }
    public void setTitle(String title){
        this.title = title;
    }
    public String getDescription(){
        return description;
    }
    public void setDescription(String description){
        this.description = description;
    }
    public String getTechnologies(){
        return technologies;
    }
    public void setTechnologies(String technologies){
        this.technologies = technologies;
    }
    public String getLink(){
        return link;
    }
    public void setLink(String link){
        this.link = link;
    }



}

