java -jar closure.jar -O SIMPLE --js='jquery.simplecolorpicker.js' --js='bootstrap-select.js' --js='pixi.js' --js='TransparencyHitArea.js' --js='curve.js' --js='planner.js' --js_output_file combined.js --create_source_map='combined.js.map' --source_map_format=V3
printf "\n//# sourceMappingURL=combined.js.map" >> combined.js 
