# Presentation Design — Prompt Templates

## Template Syntax

Use `@deck-type [parameters]` for direct mode (skips questions):

```
@pitch-deck [industry] [stage] [slide-count]
@sales-deck [product-type] [audience-size]
@training-deck [topic] [duration] [level]
@conference-deck [topic] [duration] [style]
@data-deck [topic] [metrics] [frequency]
```

## Examples

### Pitch Deck
```
@pitch-deck fintech seed 10
→ Loads pitch framework with: {industry: fintech, stage: seed, slides: 10}

@pitch-deck b2b-saas series-a 12
→ Loads pitch framework with: {industry: b2b-saas, stage: series-a, slides: 12}
```

### Sales Deck
```
@sales-deck saas enterprise
→ Loads sales framework with: {product: saas, audience: enterprise}

@sales-deck cybersecurity mid-market
→ Loads sales framework with: {product: cybersecurity, audience: mid-market}
```

### Training Deck
```
@training-deck sql 45min beginner
→ Loads training framework with: {topic: sql, duration: 45min, level: beginner}

@training-deck onboarding 60min all-levels
→ Loads training framework with: {topic: onboarding, duration: 60min, level: all}
```

### Conference Deck
```
@conference-deck ai-ethics 15min ted
→ Loads conference framework with: {topic: ai-ethics, duration: 15min, style: ted}

@conference-deck remote-work 30min keynote
→ Loads conference framework with: {topic: remote-work, duration: 30min, style: keynote}
```

### Data Deck
```
@data-deck q4-review revenue-churn-cac quarterly
→ Loads data framework with: {topic: q4-review, metrics: revenue-churn-cac, frequency: quarterly}

@data-deck user-growth channels-regions monthly
→ Loads data framework with: {topic: user-growth, metrics: channels-regions, frequency: monthly}
```

## Interactive vs Direct Mode

**Interactive** (default when no template detected):
- AI asks 1-3 questions about audience, goal, duration
- Best for: New users, unclear requirements
- More accurate classification

**Direct** (template mode):
- AI skips all questions and loads framework immediately
- Best for: Power users who know what they want
- Faster but requires correct template syntax

## Good Prompts (with context)

**Pitch**:
- "Create a 10-slide pitch deck for my AI supply chain startup, $150K ARR, targeting $2M Series A"
- "Build investor deck for fintech app helping freelancers with taxes, pre-seed stage"
- "Pitch deck for B2B SaaS reducing customer churn by 30%, seed round"

**Sales**:
- "Create sales deck for AI lead scoring tool targeting SaaS sales teams, 15 slides"
- "Build demo deck for project management software showing ROI for marketing teams"
- "Sales presentation for cybersecurity platform, enterprise focus"

**Training**:
- "Create SQL training for customer support team, beginner level, 45 minutes, 25 slides"
- "Build onboarding deck for new sales hires covering CRM, pitch, and objection handling"
- "Training presentation for developers on code review best practices"

**Conference**:
- "TED-style talk about AI ethics in hiring, 15 minutes, visual-first"
- "Keynote on future of remote work, storytelling approach, dramatic opening"
- "Conference presentation: How we scaled to 10M users, narrative arc"

**Data**:
- "Create Q4 review deck for board: revenue, churn, CAC, NPS trends, 15 slides"
- "Data presentation showing user growth by channel and region, executive summary"
- "Quarterly metrics deck with recommendations for Q1, appendix with detailed charts"

## Bad Prompts (missing context)

- "Make me a presentation" (no audience, no goal, no duration)
- "Create some slides" (completely ambiguous)
- "Tell them all our features" (feature-centric, no framework)
- "Put our documentation in slides" (documentation ≠ presentation)
- "Make it comprehensive" (training needs focus, not comprehensiveness)
