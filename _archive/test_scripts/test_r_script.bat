@echo off
echo Testing R script execution...
E:\R-4.4.1\bin\Rscript.exe --vanilla singlecell_api_adapter.R --function=query --gene=KIT
echo Exit code: %ERRORLEVEL%
pause