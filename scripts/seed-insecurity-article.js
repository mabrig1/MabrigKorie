require('dotenv').config();
const mongoose = require('mongoose');
const Work = require('../models/Work');

const content = `
<p><em>Mabrig Korie</em></p>

<h3>Abstract</h3>
<p>Nigeria's Fourth Republic (1999–present) was inaugurated with high expectations of democratic dividends, sustained economic growth, and national renewal. Instead, the period has been marked by the evolution of complex, multi-dimensional insecurity challenges&mdash;including the Boko Haram insurgency, farmer-herder conflicts, armed banditry, kidnapping-for-ransom, and communal violence&mdash;that have exerted significant drag on economic performance. This article applies an adapted <strong>lifecycle assessment (LCA)</strong> framework&mdash;drawing conceptual inspiration from environmental and social LCA methodologies&mdash;to analyze how insecurity has emerged, escalated, entrenched, and persisted across distinct phases of the Fourth Republic, generating direct, indirect, and cumulative economic costs.</p>

<p>Using evidence from econometric studies, conflict databases, government reports, and humanitarian assessments (2009&ndash;2026), the analysis shows that insecurity has disrupted agriculture (a critical employer and food security pillar), deterred investment, destroyed physical and human capital, inflated fiscal burdens through security spending, and contributed to regional and national economic volatility. While aggregate GDP growth has occasionally remained positive (averaging ~2.8&ndash;4% in recent years amid other headwinds), business activity, sectoral productivity, and long-term development potential have been severely compromised. The lifecycle perspective reveals path-dependent and compounding effects that static analyses often obscure, underscoring the need for integrated, phase-sensitive policy responses. The article concludes with recommendations for a comprehensive security-development-peacebuilding strategy aligned with Nigeria's economic aspirations.</p>

<p><strong>Keywords:</strong> Insecurity, economic growth, lifecycle assessment, Fourth Republic, Nigeria, Boko Haram, banditry, farmer-herder conflict, investment, agriculture</p>

<p><strong>JEL Codes:</strong> O11 (Macroeconomic Analyses of Economic Development), O43 (Institutions and Growth), D74 (Conflict; Conflict Resolution; Alliances), H56 (National Security and War), Q18 (Agricultural Policy; Food Security)</p>

<h3>1. Introduction</h3>
<p>Nigeria returned to civilian rule in 1999 amid widespread optimism that democracy would unlock inclusive growth, attract foreign direct investment (FDI), and address decades of military-era mismanagement. Over 25 years later, the Fourth Republic has delivered periods of respectable GDP expansion&mdash;driven largely by oil revenues, banking reforms, and episodic high commodity prices&mdash;yet transformative, broad-based prosperity remains elusive. Per capita income growth has been modest, poverty and inequality persistent, and structural vulnerabilities exposed.</p>

<p>A central binding constraint has been the rise and mutation of <strong>insecurity</strong>. What began with Niger Delta militancy and sporadic communal clashes evolved into the Boko Haram insurgency (from 2009), intensified farmer-herder violence (peaking post-2015), and widespread armed banditry and kidnapping in the Northwest and beyond. These threats have not remained geographically or temporally contained; they have spread, diversified, and interacted with economic, demographic, and governance factors.</p>

<p>Traditional analyses often treat insecurity as a static variable in cross-sectional or single-period regressions. This article advances a <strong>dynamic lifecycle assessment</strong> approach. Adapted from life-cycle thinking (where impacts are traced from "cradle" through use, end-of-life, and externalities), the framework maps the <strong>insecurity lifecycle</strong> across four phases of the Fourth Republic:</p>
<ol>
<li><strong>Emergence</strong> (1999&ndash;2009)</li>
<li><strong>Escalation</strong> (2009&ndash;2015)</li>
<li><strong>Entrenchment and Diversification</strong> (2015&ndash;2023)</li>
<li><strong>Persistent Multi-Front Challenge</strong> (2023&ndash;present)</li>
</ol>
<p>At each stage, direct costs (deaths, destruction, displacement), indirect costs (lost productivity, deterred investment, human capital erosion), and fiscal consequences are assessed, alongside cumulative and lagged effects. This reveals how early-phase decisions and inactions shape later economic outcomes and why Nigeria's growth has underperformed relative to potential despite resource endowments.</p>

<h3>2. Conceptual Framework: Adapting Lifecycle Assessment to the Insecurity&ndash;Economy Nexus</h3>
<p>Life Cycle Assessment (LCA) systematically evaluates environmental (and, in Social LCA, socio-economic) impacts across a product's or system's full lifespan. Here, the "product" is the phenomenon of violent insecurity itself&mdash;its emergence, intensification, geographic spread, and socio-economic footprint&mdash;within Nigeria's evolving democratic and economic context.</p>

<p><strong>Key stages in the adapted insecurity lifecycle:</strong></p>
<ul>
<li><strong>Stage 1: Onset/Emergence</strong> &mdash; Initial triggers (grievances, resource competition, weak state presence, ideological mobilization).</li>
<li><strong>Stage 2: Escalation/Expansion</strong> &mdash; Rapid intensification, territorial gains by non-state actors, mass casualties, and displacement.</li>
<li><strong>Stage 3: Entrenchment/Persistence</strong> &mdash; Institutionalization of conflict economies (ransom, extortion, illicit trade), adaptation by armed groups, and spread to new fronts.</li>
<li><strong>Stage 4: Mitigation, Transformation, or Chronicity</strong> &mdash; Partial containment, policy responses, or failure leading to protracted low-intensity conflict with periodic spikes.</li>
</ul>
<p>Economic impacts are evaluated across <strong>direct</strong> (immediate destruction and loss of life/labor), <strong>indirect</strong> (behavioral responses: reduced mobility, investment, trade; sectoral multipliers), and <strong>cumulative/long-term</strong> (human capital loss, eroded institutions, poverty traps, fiscal crowding-out) dimensions. This dynamic lens highlights feedback loops (e.g., displacement &rarr; abandoned farmland &rarr; food inflation &rarr; further grievances) often missed in static models.</p>

<h3>3. The Evolution of Insecurity Across the Fourth Republic</h3>
<p><strong>Phase 1: Emergence (1999&ndash;2009)</strong><br>
The early republic saw Niger Delta militancy (kidnappings, oil bunkering, pipeline vandalism) alongside ethnic/religious clashes and political thuggery. Boko Haram's precursor activities simmered in the Northeast. The economy benefited from debt relief, banking consolidation, and high oil prices, with GDP growth often exceeding 5&ndash;6% in peak years. Insecurity was regionally contained and did not yet dominate national economic discourse.</p>

<p><strong>Phase 2: Escalation (2009&ndash;2015)</strong><br>
Boko Haram's 2009 uprising and subsequent insurgency transformed the landscape. By 2014&ndash;2015, the group controlled significant territory in Borno and neighboring states. The Chibok abduction (2014) symbolized the crisis. Farmer-herder tensions simmered but had not yet exploded nationally. Economic growth continued (aided by oil), but early signs of strain appeared in the Northeast: destroyed infrastructure, collapsed local markets, and rising internally displaced persons (IDPs). Security spending began to rise.</p>

<p><strong>Phase 3: Entrenchment and Diversification (2015&ndash;2023)</strong><br>
Under the Buhari administration, territorial control against Boko Haram improved (aided by the Multinational Joint Task Force), yet the group mutated (ISWAP faction) and persisted in asymmetric attacks. Critically, <strong>farmer-herder conflicts</strong> surged&mdash;often deadlier than Boko Haram in certain years (e.g., ~2,000+ deaths annually in peaks around 2016&ndash;2018, concentrated in Benue, Plateau, Kaduna). Armed <strong>banditry</strong> exploded in the Northwest (Zamfara, Katsina, Kaduna), featuring cattle rustling, mass kidnappings, and village raids. Separatist tensions (IPOB) and "unknown gunmen" emerged in the Southeast.</p>

<p>Cumulative impacts became stark: millions displaced (over 2 million from Boko Haram alone historically; hundreds of thousands more from banditry and herder-farmer clashes), thousands of farmlands abandoned, schools and markets destroyed or closed, and businesses relocating or operating at skeletal capacity.</p>

<p><strong>Phase 4: Persistent Multi-Front Challenge (2023&ndash;present)</strong><br>
Insecurity remains multi-dimensional under the Tinubu administration. Boko Haram/ISWAP continues low-level operations in the Northeast. Banditry and kidnapping persist and spread. Farmer-herder and communal violence continue in the North-Central and beyond. Recent data show thousands killed annually across hotspots (e.g., over 10,000 in select states in a recent two-year period per some tallies), with ongoing displacement (hundreds of thousands in Northwest and North-Central).</p>

<p>Economic reforms (subsidy removal, exchange rate unification) have coincided with high inflation and hardship, while security demands prompted major fiscal allocations (e.g., hundreds of billions of naira deducted for security funds in 2026).</p>

<h3>4. Economic Impacts: Phase-Specific and Cumulative</h3>
<p>Empirical literature consistently documents negative effects, though aggregate GDP impact is sometimes masked by unaffected sectors or offset by oil dynamics. Studies using ARDL and other time-series methods find insecurity exerts statistically significant negative pressure on growth, investment, and fiscal space, with stronger effects on business activity and sectoral output (Yusuf, 2022; Akindoyin et al., 2025).</p>

<p><strong>Direct costs</strong> include loss of life (tens of thousands from Boko Haram; thousands more from banditry and herder-farmer clashes cumulatively), destruction of homes, schools, clinics, roads, and markets, and ransom payments running into billions of naira in affected states.</p>

<p><strong>Indirect and sectoral costs</strong> are larger and more pervasive:</p>
<ul>
<li><strong>Agriculture and food security</strong>: The sector contributes ~20&ndash;25% of GDP but employs the majority of the population. Attacks and displacement have led to abandoned farmlands (e.g., thousands of hectares in Katsina), production drops of 33&ndash;65% in hard-hit states, livestock losses, and disrupted supply chains. This fuels food inflation and national food insecurity (International Crisis Group, 2018).</li>
<li><strong>Investment and business climate</strong>: FDI and domestic capital formation decline in high-risk zones. Businesses close, relocate, or operate below capacity. Broader uncertainty raises risk premiums and discourages long-term projects.</li>
<li><strong>Human capital</strong>: Mass school closures/abductions (Chibok and others), orphaned children, and disrupted education/health services create long-term productivity losses. Undernourishment rose sharply in conflict peaks.</li>
<li><strong>Fiscal burden</strong>: Rising security expenditure crowds out capital spending on infrastructure, education, and health. Recent examples include substantial FAAC deductions for security interventions (BudgIT, 2026).</li>
<li><strong>Cumulative effects</strong>: Regional poverty traps, eroded social cohesion, capital flight/brain drain, and weakened institutions. One estimate placed the cost of violence at around 8% of GDP in 2021 (Eneh, 2025).</li>
</ul>
<p>National GDP growth has been volatile (strong early-2000s and some post-recession recovery years; recessions in 2016 and 2020; ~3.3&ndash;4.1% in 2023&ndash;2024). Insecurity explains part of the underperformance relative to potential, particularly the divergence between headline growth and inclusive outcomes.</p>

<h3>5. Discussion: Governance, Root Causes, and the Value of the Lifecycle Lens</h3>
<p>The lifecycle view clarifies why insecurity has been so economically damaging: effects compound across phases. Early displacement and destruction create enduring human capital deficits and grievance cycles that fuel later recruitment and conflict economies. Static analyses understate these dynamics.</p>

<p>Root causes are multifaceted and interconnected: historical marginalization and weak state presence in peripheral regions; rapid population growth and climate/desertification pressures intensifying resource competition (land, water for herders and farmers); arms proliferation; youth unemployment and poverty as vulnerability factors; governance gaps (impunity, slow justice, coordination failures between federal and state levels); and, in some cases, elite manipulation or criminal opportunism.</p>

<p>Successes exist&mdash;territorial gains against Boko Haram, some community resilience, and international partnerships&mdash;but responses have often been predominantly kinetic and reactive rather than preventive or developmental. This prolongs Stage 3&ndash;4 dynamics.</p>

<h3>6. Conclusion and Policy Implications</h3>
<p>A lifecycle assessment of insecurity in Nigeria's Fourth Republic demonstrates that these challenges have functioned as a chronic, compounding tax on economic growth and development potential. The costs&mdash;human, material, fiscal, and developmental&mdash;have been regionally devastating and nationally consequential, preventing the full realization of democratic and economic dividends.</p>

<p><strong>Key recommendations:</strong></p>
<ul>
<li>Adopt an integrated <strong>security-development-peacebuilding strategy</strong> that addresses both symptoms and root causes (economic opportunity, land/resource governance reform with stakeholder inclusion, justice and accountability, climate adaptation).</li>
<li>Invest in <strong>data-driven lifecycle monitoring</strong>&mdash;composite insecurity and economic cost indices tracked by phase and region&mdash;to enable early intervention before entrenchment.</li>
<li>Strengthen federal-state coordination, community policing/intelligence, and regional cooperation (Lake Chad Basin, ECOWAS).</li>
<li>Prioritize human capital restoration in affected areas (education catch-up programs, psychosocial support, livelihood restoration for IDPs and host communities).</li>
<li>Rebalance fiscal priorities toward preventive development while maintaining credible deterrence.</li>
<li>Foster inclusive national dialogue on contentious issues (resource allocation, identity, citizenship) to reduce elite exploitation of grievances.</li>
</ul>
<p>Future research could empirically operationalize the lifecycle framework through panel data models, computable general equilibrium simulations of sectoral multipliers, or Social LCA-inspired stakeholder impact assessments.</p>

<p>Nigeria possesses the human and natural resources for shared prosperity. Realizing this potential requires decisively breaking the insecurity&ndash;underdevelopment trap through visionary, evidence-based, and sustained action. The lifecycle perspective offers both diagnostic clarity and a roadmap for more effective intervention.</p>

<h3>References</h3>
<ul>
<li>Yusuf, A. (2022). Growth and Fiscal Effects of Insecurity on the Nigerian Economy. <em>PMC</em>.</li>
<li>BudgIT (2026). <em>Nigeria's Rising Insecurity: Implications for the Nigerian Economy</em>.</li>
<li>International Crisis Group (2018). <em>Stopping Nigeria's Spiralling Farmer-Herder Violence</em>.</li>
<li>Eneh, O.C. (2025). A longitudinal study of violent armed conflict and economic indicators in Nigeria.</li>
<li>Akindoyin, D.I. et al. (2025). Evaluating the Impact of Insecurity on Nigeria's National Development Since the Fourth Republic.</li>
<li>Additional sources: World Bank GDP data; ACLED/Uppsala Conflict Data Program; UN/OCHA humanitarian reports; Institute for Economics and Peace violence cost estimates; peer-reviewed journal articles on ARDL modeling of insecurity and growth in Nigeria (2015&ndash;2025).</li>
</ul>
`;

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const slug = 'insecurity-and-economic-growth-lifecycle-assessment-nigeria-fourth-republic';
  const count = await Work.countDocuments({ category: 'research' });

  const work = await Work.findOneAndUpdate(
    { slug },
    {
      category: 'research',
      title: "Insecurity and Economic Growth: A Lifecycle Assessment in Nigeria's Fourth Republic",
      description:
        "An adapted lifecycle assessment framework tracing how insecurity has emerged, escalated, entrenched, and persisted across Nigeria's Fourth Republic, and its compounding economic costs.",
      tags: ['Insecurity', 'Economic Growth', 'Lifecycle Assessment', 'Nigeria', 'Political Economy'],
      content,
      featured: false,
      order: count,
      slug,
      seoTitle: "Insecurity and Economic Growth in Nigeria's Fourth Republic — Mabrig Korie",
      seoDescription:
        "A lifecycle assessment of how insecurity has shaped economic outcomes across Nigeria's Fourth Republic, from Boko Haram to banditry and farmer-herder conflict.",
      seoKeywords: ['insecurity', 'economic growth', 'Nigeria', 'Boko Haram', 'banditry', 'farmer-herder conflict', 'Fourth Republic'],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('Upserted work:', work.slug, work._id.toString());
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
