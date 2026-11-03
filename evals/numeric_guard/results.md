Numeric guard eval, seed 1: 50 correct scripts, 266 mutated copies.

| Mutation type | Mutants | Caught | Recall |
|---|---:|---:|---:|
| `digit_swap` | 25 | 25 | 100.0% |
| `off_by_10pct` | 50 | 50 | 100.0% |
| `unit_scale` (known gap) | 49 | 0 | 0.0% |
| `rounding` | 37 | 37 | 100.0% |
| `number_in_words` | 50 | 50 | 100.0% |
| `swapped_field` (known gap) | 37 | 0 | 0.0% |
| `dropped_separator` | 18 | 18 | 100.0% |
| **All mutations** | **266** | **180** | **67.7%** |

| Correct scripts | Scripts | Flagged | False-positive rate |
|---|---:|---:|---:|
| `en_reword` | 10 | 0 | 0.0% |
| `hi` | 10 | 0 | 0.0% |
| `hi_devanagari` | 10 | 0 | 0.0% |
| `te` | 10 | 0 | 0.0% |
| `te_telugu` | 10 | 0 | 0.0% |
| **All correct scripts** | **50** | **0** | **0.0%** |

Known gaps:

- `unit_scale` (49 missed): the digits are unchanged, only the unit word differs, and the guard compares numbers only. Example `bajaj-pulsar-ns400z/01-hook/hi/unit_scale`: 5.2 lakh -> 5.2 crore gives no problem.
- `swapped_field` (37 missed): the same numbers in other places give the same set of numbers, and the guard compares sets. Example `bajaj-pulsar-ns400z/01-hook/hi/swapped_field`: 5.2 <-> 2.7 gives no problem.
