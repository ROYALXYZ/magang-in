# A/B Testing Report - Magang-in AI

## Experiment Design
- **Hipotesis**: Top 5 skill menghasilkan akurasi matching lebih baik dari Top 3 skill
- **Grup A (Kontrol)**: Top 3 skill
- **Grup B (Treatment)**: Top 5 skill
- **Sample Size**: 500 users
- **Metrik**: Final Score (0.4×model_score + 0.6×coverage_score)

## Results

| Metric | Top 3 | Top 5 | Improvement |
|--------|---------------------|----------------------|-------------|
| Final Score | 0.4479 | 0.5193 | **+15.9%** |
| Coverage Score | 0.2880 | 0.4459 | **+54.9%** |
| Strong Matches | 1.44 | 1.37 | -4.5% |

## Statistical Analysis
- **Test**: Mann-Whitney U Test
- **P-value**: 0.000000
- **Alpha**: 0.05
- **Conclusion**: **SIGNIFICANT** (p < 0.05)

## Recommendation
✅ **Top 5 skill is better than Top 3 skill**
- Final Score improvement: **+15.9%**
- Coverage Score improvement: **+54.9%**
- Statistically significant with p < 0.05

---
*Report generated: 2026-05-28 20:21:10*
