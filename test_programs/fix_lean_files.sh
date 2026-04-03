#!/!/bin/bash
# Fix all Lean files in current directory
set -e

for file in 66_minimum_spanning_tree.lean 80_z_algorithm.lean 81_suffix_array.lean 82_longest_common_substring.lean 83_edit_distance.lean 84_longest_palindrome.lean 85_rabin_karp.lean 86_kmp_search.lean 87_manacher.lean 90_suffix_tree.lean 91_lazy_segment_tree.lean 92_persistent_segment_tree.lean 93_wavelet_tree.lean 94_fenwick_2d.lean 95_lca.lean 96_heavy_light.lean 97_centroid_decomp.lean 98_euler_tour.lean 99_virtual_tree.lean; do
  if lean "$file" > /dev/null 2>&1; then
    echo "Fixing $file..."
    # Common fixes
    sed -i '' 's/Array\.get!/Array.getD/g' "$file"
    sed -i '' 's/Array\.set!/Array.set/g' "$file"
    sed -i '' 's/String\.get!/String.Pos.Raw.get!/g' "$file"
    sed -i '' 's/\.get!/getD/g' "$file"
    
    # Try to compile
    if lean "$file" 2>&1 | grep -E "error:" > /dev/null; then
      echo "Still errors in $file"
    else
      echo "Fixed $file successfully"
    fi
  else
    echo "$file already OK"
  fi
done
