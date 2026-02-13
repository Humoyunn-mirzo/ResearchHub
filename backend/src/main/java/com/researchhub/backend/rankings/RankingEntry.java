package com.researchhub.backend.rankings;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RankingEntry {
    private int rank;
    private String name;
    private String subtitle;
    private String valueLabel;
    private String href;
}
