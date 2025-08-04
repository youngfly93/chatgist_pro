@echo off
echo === 测试 Single-cell Plumber API ===

echo.
echo 1. 测试健康检查...
curl -X GET "http://localhost:8003/singlecell/health" -H "accept: application/json"

echo.
echo.
echo 2. 测试基因查询 (KIT)...
curl -X POST "http://localhost:8003/singlecell/query" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"gene\":\"KIT\"}"

echo.
echo.
echo 3. 测试小提琴图生成 (MCM7)...
curl -X POST "http://localhost:8003/singlecell/violin" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"gene\":\"MCM7\"}"

echo.
echo.
echo 4. 测试 UMAP 细胞类型图...
curl -X POST "http://localhost:8003/singlecell/umap_celltype" -H "accept: application/json" -H "Content-Type: application/json" -d "{}"

echo.
echo.
echo 5. 测试 UMAP 基因表达图 (KIT)...
curl -X POST "http://localhost:8003/singlecell/umap_expression" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"gene\":\"KIT\"}"

echo.
echo.
echo === 测试完成 ===
echo.
echo 如果所有测试都返回了JSON数据，说明API正常工作
echo 访问 http://localhost:8003/__docs__/ 查看完整API文档
echo.
pause