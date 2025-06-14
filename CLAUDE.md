# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

This is a **dbGIST (database GIST)** Shiny web application for analyzing gastrointestinal stromal tumor (GIST) gene expression data. The application provides interactive visualizations and statistical analyses for GIST genomic research.

## Key Commands

### Running the Application
```bash
# Start the Shiny app
R -e "shiny::runApp()"

# Or from within R console
shiny::runApp()
```

### Package Installation
All required packages are loaded in `global.R`. If packages are missing, install them using:
```r
install.packages(c("shiny", "bs4Dash", "shinyjs", "shinyBS", "tidyverse", "data.table", "stringr", "ggplot2", "ggsci", "patchwork", "pROC"))

# Bioconductor packages
BiocManager::install(c("clusterProfiler", "org.Hs.eg.db", "EnsDb.Hsapiens.v75"))
```

## Architecture & Structure

### Core Components
1. **global.R**: Loads all dependencies and data files, defines clinical data categories, creates analysis functions
2. **ui.R**: Defines the dashboard layout with 5 modules using bs4Dash framework
3. **server.R**: Handles reactive logic, user interactions, plot generation, and data downloads

### Data Files (in `original/`)
- **dbGIST_matrix(2).Rdata**: Main gene expression matrices with clinical data
- **dbGIST_ImmuneCell.RData**: Immune cell infiltration data
- **dbGIST_msigdb.RData**: MSigDB pathway database
- **dbGIST_wikipathways.RData**: WikiPathways database
- **GSE15966_20230217.CSV**: Clinical data for specific GEO dataset

### Key Functions (defined in global.R)
- `Judge_GENESYMBOL()`: Validates gene symbols
- `dbGIST_boxplot_*()`: Creates boxplots for different clinical parameters (Risk, Mutation, Age, etc.)
- `dbGIST_cor_ID()`: Gene-gene correlation analysis
- `dbGIST_boxplot_Drug()`: Drug resistance analysis with ROC curves
- `dbGIST_boxplot_PrePost()`: Pre/post treatment comparison

### Clinical Data Categories
The application analyzes gene expression across:
- Age, Gender, Risk, Location
- Mutation type and chromosome
- Tumor size, stage, grade
- Metastatic status
- Imatinib resistance
- Pre/post treatment status

## Development Notes

- The application uses reactive programming for dynamic updates
- All visualization functions use ggplot2 with consistent theming
- Statistical tests include t-tests, correlation analysis, and ROC curves
- Data is structured as lists of matrices with associated clinical information
- No package management system (renv/packrat) is currently implemented