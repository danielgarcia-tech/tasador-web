import os
import json

base_path = r'public\BAREMOS HONORARIOS\CRITERIOS TASACIÓN COSTAS'
result = {}

for ccaa in sorted(os.listdir(base_path)):
    ccaa_path = os.path.join(base_path, ccaa)
    if os.path.isdir(ccaa_path):
        provinces = {}
        for prov in sorted(os.listdir(ccaa_path)):
            prov_path = os.path.join(ccaa_path, prov)
            if os.path.isdir(prov_path):
                files = sorted([f for f in os.listdir(prov_path) if os.path.isfile(os.path.join(prov_path, f))])
                provinces[prov] = files
        result[ccaa] = provinces

with open(r'baremos_structure.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print("Estructura generada - Resumen:")
print(f"Total CCAA: {len(result)}")
for ccaa, provinces in result.items():
    total_files = sum(len(files) for files in provinces.values())
    print(f"  {ccaa}: {len(provinces)} provincias, {total_files} archivos")
