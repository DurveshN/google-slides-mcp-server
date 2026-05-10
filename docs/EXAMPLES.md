# 💡 Examples & Use Cases

Practical examples for common Google Slides automation scenarios.

## Table of Contents

- [Basic Examples](#basic-examples)
- [Business Use Cases](#business-use-cases)
- [Educational Content](#educational-content)
- [Data Visualization](#data-visualization)
- [Template Automation](#template-automation)
- [Advanced Patterns](#advanced-patterns)

---

## Basic Examples

### Example 1: Create a Simple Presentation

Create a basic presentation with a title slide and content slide.

```typescript
// Step 1: Create the presentation
const presentation = await create_presentation({
  title: "My First Presentation"
});

const presentationId = presentation.presentationId;

// Step 2: Add title slide
const titleSlide = await create_slide({
  presentationId,
  layout: "TITLE_SLIDE",
  insertionIndex: 0
});

// Step 3: Add title text
await add_text_box({
  presentationId,
  slideId: titleSlide.slideId,
  text: "Welcome to My Presentation",
  x: 1,
  y: 2,
  width: 8,
  height: 1,
  fontSize: 44,
  bold: true,
  color: "#1a73e8"
});

// Step 4: Add subtitle
await add_text_box({
  presentationId,
  slideId: titleSlide.slideId,
  text: "A comprehensive overview",
  x: 1,
  y: 3.5,
  width: 8,
  height: 0.5,
  fontSize: 20,
  color: "#5f6368"
});

// Step 5: Add content slide
const contentSlide = await create_slide({
  presentationId,
  layout: "TITLE_AND_BODY",
  insertionIndex: 1
});

console.log(`Presentation created: ${presentation.url}`);
```

---

### Example 2: Add Bullet Points

Create a slide with formatted bullet points.

```typescript
// Create slide
const slide = await create_slide({
  presentationId,
  layout: "BLANK"
});

// Add title
await add_text_box({
  presentationId,
  slideId: slide.slideId,
  text: "Key Features",
  x: 0.5,
  y: 0.5,
  width: 9,
  height: 0.75,
  fontSize: 32,
  bold: true
});

// Add bullet points
const bulletBox = await add_text_box({
  presentationId,
  slideId: slide.slideId,
  text: "Easy to use\nPowerful automation\nFully customizable\nCloud-based",
  x: 1,
  y: 1.5,
  width: 8,
  height: 3,
  fontSize: 18
});

// Apply bullet formatting
await create_bullets({
  presentationId,
  elementId: bulletBox.elementId,
  startIndex: 0,
  endIndex: 100,
  bulletPreset: "BULLET_DISC"
});
```

---

### Example 3: Add Images

Insert and position images on a slide.

```typescript
// Create slide
const slide = await create_slide({
  presentationId,
  layout: "BLANK"
});

// Add title
await add_text_box({
  presentationId,
  slideId: slide.slideId,
  text: "Our Product",
  x: 0.5,
  y: 0.5,
  width: 9,
  height: 0.75,
  fontSize: 32,
  bold: true
});

// Add product image
const image = await add_image({
  presentationId,
  slideId: slide.slideId,
  imageUrl: "https://example.com/product-screenshot.png",
  x: 2,
  y: 1.5,
  width: 6,
  height: 3.5
});

// Add caption
await add_text_box({
  presentationId,
  slideId: slide.slideId,
  text: "Figure 1: Product Dashboard",
  x: 2,
  y: 5.2,
  width: 6,
  height: 0.3,
  fontSize: 12,
  color: "#5f6368"
});
```

---

## Business Use Cases

### Sales Deck Generator

Automatically generate a sales presentation from data.

```typescript
async function createSalesDeck(companyData) {
  // Create presentation
  const presentation = await create_presentation({
    title: `${companyData.name} - Sales Proposal`
  });
  
  const presentationId = presentation.presentationId;
  
  // Slide 1: Title
  const titleSlide = await create_slide({
    presentationId,
    layout: "TITLE_SLIDE"
  });
  
  await add_text_box({
    presentationId,
    slideId: titleSlide.slideId,
    text: companyData.name,
    x: 1,
    y: 2,
    width: 8,
    height: 1,
    fontSize: 44,
    bold: true
  });
  
  await add_text_box({
    presentationId,
    slideId: titleSlide.slideId,
    text: `Sales Proposal | ${new Date().toLocaleDateString()}`,
    x: 1,
    y: 3.5,
    width: 8,
    height: 0.5,
    fontSize: 18
  });
  
  // Slide 2: Problem Statement
  const problemSlide = await create_slide({
    presentationId,
    layout: "TITLE_AND_BODY"
  });
  
  await add_text_box({
    presentationId,
    slideId: problemSlide.slideId,
    text: "The Challenge",
    x: 0.5,
    y: 0.5,
    width: 9,
    height: 0.75,
    fontSize: 32,
    bold: true
  });
  
  const problemText = await add_text_box({
    presentationId,
    slideId: problemSlide.slideId,
    text: companyData.problems.join("\n"),
    x: 1,
    y: 1.5,
    width: 8,
    height: 3,
    fontSize: 18
  });
  
  await create_bullets({
    presentationId,
    elementId: problemText.elementId,
    startIndex: 0,
    endIndex: 1000,
    bulletPreset: "BULLET_DISC"
  });
  
  // Slide 3: Solution
  const solutionSlide = await create_slide({
    presentationId,
    layout: "TITLE_AND_BODY"
  });
  
  await add_text_box({
    presentationId,
    slideId: solutionSlide.slideId,
    text: "Our Solution",
    x: 0.5,
    y: 0.5,
    width: 9,
    height: 0.75,
    fontSize: 32,
    bold: true,
    color: "#1a73e8"
  });
  
  // Add solution image
  await add_image({
    presentationId,
    slideId: solutionSlide.slideId,
    imageUrl: companyData.productImageUrl,
    x: 2,
    y: 1.5,
    width: 6,
    height: 3.5
  });
  
  // Slide 4: Pricing
  const pricingSlide = await create_slide({
    presentationId,
    layout: "BLANK"
  });
  
  await add_text_box({
    presentationId,
    slideId: pricingSlide.slideId,
    text: "Pricing",
    x: 0.5,
    y: 0.5,
    width: 9,
    height: 0.75,
    fontSize: 32,
    bold: true
  });
  
  // Add pricing table
  const table = await add_table({
    presentationId,
    slideId: pricingSlide.slideId,
    rows: 4,
    columns: 3,
    x: 1.5,
    y: 1.5,
    width: 7,
    height: 3
  });
  
  // Populate pricing table using batch update
  await batch_update({
    presentationId,
    requests: [
      {
        insertText: {
          objectId: table.elementId,
          cellLocation: { rowIndex: 0, columnIndex: 0 },
          text: "Plan"
        }
      },
      {
        insertText: {
          objectId: table.elementId,
          cellLocation: { rowIndex: 0, columnIndex: 1 },
          text: "Features"
        }
      },
      {
        insertText: {
          objectId: table.elementId,
          cellLocation: { rowIndex: 0, columnIndex: 2 },
          text: "Price"
        }
      },
      ...companyData.pricingTiers.flatMap((tier, idx) => [
        {
          insertText: {
            objectId: table.elementId,
            cellLocation: { rowIndex: idx + 1, columnIndex: 0 },
            text: tier.name
          }
        },
        {
          insertText: {
            objectId: table.elementId,
            cellLocation: { rowIndex: idx + 1, columnIndex: 1 },
            text: tier.features
          }
        },
        {
          insertText: {
            objectId: table.elementId,
            cellLocation: { rowIndex: idx + 1, columnIndex: 2 },
            text: tier.price
          }
        }
      ])
    ]
  });
  
  // Share with team
  await update_permissions({
    presentationId,
    email: companyData.salesRepEmail,
    role: "writer"
  });
  
  return presentation;
}

// Usage
const deck = await createSalesDeck({
  name: "Acme Corp",
  problems: [
    "Manual data entry wastes 10 hours per week",
    "Error rates exceed 15%",
    "No real-time visibility into operations"
  ],
  productImageUrl: "https://example.com/dashboard.png",
  pricingTiers: [
    { name: "Starter", features: "Up to 10 users", price: "$99/mo" },
    { name: "Professional", features: "Up to 50 users", price: "$299/mo" },
    { name: "Enterprise", features: "Unlimited users", price: "Custom" }
  ],
  salesRepEmail: "sales@example.com"
});

console.log(`Sales deck created: ${deck.url}`);
```

---

### Quarterly Report Automation

Generate quarterly business reports automatically.

```typescript
async function createQuarterlyReport(quarter, year, metrics) {
  const presentation = await create_presentation({
    title: `Q${quarter} ${year} Business Review`
  });
  
  const presentationId = presentation.presentationId;
  
  // Title slide
  const titleSlide = await create_slide({
    presentationId,
    layout: "TITLE_SLIDE"
  });
  
  await add_text_box({
    presentationId,
    slideId: titleSlide.slideId,
    text: `Q${quarter} ${year}`,
    x: 1,
    y: 1.5,
    width: 8,
    height: 1,
    fontSize: 54,
    bold: true
  });
  
  await add_text_box({
    presentationId,
    slideId: titleSlide.slideId,
    text: "Business Review",
    x: 1,
    y: 2.8,
    width: 8,
    height: 0.8,
    fontSize: 32
  });
  
  // Executive Summary
  const summarySlide = await create_slide({
    presentationId,
    layout: "TITLE_AND_BODY"
  });
  
  await add_text_box({
    presentationId,
    slideId: summarySlide.slideId,
    text: "Executive Summary",
    x: 0.5,
    y: 0.5,
    width: 9,
    height: 0.75,
    fontSize: 32,
    bold: true
  });
  
  // Key metrics in a grid
  const metricsSlide = await create_slide({
    presentationId,
    layout: "BLANK"
  });
  
  await add_text_box({
    presentationId,
    slideId: metricsSlide.slideId,
    text: "Key Metrics",
    x: 0.5,
    y: 0.5,
    width: 9,
    height: 0.75,
    fontSize: 32,
    bold: true
  });
  
  // Create metric cards using batch update
  const metricCards = [
    { label: "Revenue", value: metrics.revenue, x: 0.5, y: 1.5 },
    { label: "Growth", value: metrics.growth, x: 3.5, y: 1.5 },
    { label: "Customers", value: metrics.customers, x: 6.5, y: 1.5 },
    { label: "Retention", value: metrics.retention, x: 0.5, y: 3.5 }
  ];
  
  for (const metric of metricCards) {
    // Background shape
    await add_shape({
      presentationId,
      slideId: metricsSlide.slideId,
      shapeType: "ROUND_RECTANGLE",
      x: metric.x,
      y: metric.y,
      width: 2.5,
      height: 1.5
    });
    
    // Metric value
    await add_text_box({
      presentationId,
      slideId: metricsSlide.slideId,
      text: metric.value,
      x: metric.x + 0.2,
      y: metric.y + 0.3,
      width: 2.1,
      height: 0.6,
      fontSize: 32,
      bold: true,
      color: "#1a73e8"
    });
    
    // Metric label
    await add_text_box({
      presentationId,
      slideId: metricsSlide.slideId,
      text: metric.label,
      x: metric.x + 0.2,
      y: metric.y + 0.9,
      width: 2.1,
      height: 0.4,
      fontSize: 14,
      color: "#5f6368"
    });
  }
  
  return presentation;
}

// Usage
const report = await createQuarterlyReport(4, 2024, {
  revenue: "$2.4M",
  growth: "+23%",
  customers: "1,247",
  retention: "94%"
});
```

---

## Educational Content

### Course Lecture Slides

Generate educational content with consistent formatting.

```typescript
async function createLectureSlides(course, lesson) {
  const presentation = await create_presentation({
    title: `${course.code} - ${lesson.title}`
  });
  
  const presentationId = presentation.presentationId;
  
  // Title slide with course branding
  const titleSlide = await create_slide({
    presentationId,
    layout: "TITLE_SLIDE"
  });
  
  // Set brand color background
  await update_page_properties({
    presentationId,
    slideId: titleSlide.slideId,
    backgroundColor: course.brandColor
  });
  
  await add_text_box({
    presentationId,
    slideId: titleSlide.slideId,
    text: course.code,
    x: 1,
    y: 1.5,
    width: 8,
    height: 0.6,
    fontSize: 24,
    color: "#ffffff"
  });
  
  await add_text_box({
    presentationId,
    slideId: titleSlide.slideId,
    text: lesson.title,
    x: 1,
    y: 2.3,
    width: 8,
    height: 1.2,
    fontSize: 44,
    bold: true,
    color: "#ffffff"
  });
  
  // Learning objectives
  const objectivesSlide = await create_slide({
    presentationId,
    layout: "TITLE_AND_BODY"
  });
  
  await add_text_box({
    presentationId,
    slideId: objectivesSlide.slideId,
    text: "Learning Objectives",
    x: 0.5,
    y: 0.5,
    width: 9,
    height: 0.75,
    fontSize: 32,
    bold: true
  });
  
  const objectivesText = await add_text_box({
    presentationId,
    slideId: objectivesSlide.slideId,
    text: lesson.objectives.join("\n"),
    x: 1,
    y: 1.5,
    width: 8,
    height: 3,
    fontSize: 18
  });
  
  await create_bullets({
    presentationId,
    elementId: objectivesText.elementId,
    startIndex: 0,
    endIndex: 1000,
    bulletPreset: "BULLET_NUMBER"
  });
  
  // Content slides
  for (const section of lesson.sections) {
    const contentSlide = await create_slide({
      presentationId,
      layout: "TITLE_AND_BODY"
    });
    
    await add_text_box({
      presentationId,
      slideId: contentSlide.slideId,
      text: section.title,
      x: 0.5,
      y: 0.5,
      width: 9,
      height: 0.75,
      fontSize: 28,
      bold: true
    });
    
    if (section.image) {
      await add_image({
        presentationId,
        slideId: contentSlide.slideId,
        imageUrl: section.image,
        x: 1,
        y: 1.5,
        width: 8,
        height: 3.5
      });
    } else {
      const contentText = await add_text_box({
        presentationId,
        slideId: contentSlide.slideId,
        text: section.content,
        x: 1,
        y: 1.5,
        width: 8,
        height: 3.5,
        fontSize: 16
      });
    }
  }
  
  // Summary slide
  const summarySlide = await create_slide({
    presentationId,
    layout: "SECTION_HEADER"
  });
  
  await add_text_box({
    presentationId,
    slideId: summarySlide.slideId,
    text: "Summary & Next Steps",
    x: 1,
    y: 2,
    width: 8,
    height: 1,
    fontSize: 36,
    bold: true
  });
  
  return presentation;
}

// Usage
const lecture = await createLectureSlides(
  {
    code: "CS101",
    brandColor: "#1a73e8"
  },
  {
    title: "Introduction to Algorithms",
    objectives: [
      "Understand algorithm complexity",
      "Learn Big O notation",
      "Analyze common algorithms"
    ],
    sections: [
      {
        title: "What is an Algorithm?",
        content: "An algorithm is a step-by-step procedure for solving a problem..."
      },
      {
        title: "Algorithm Complexity",
        image: "https://example.com/big-o-chart.png"
      }
    ]
  }
);
```

---

## Data Visualization

### Chart and Graph Slides

Create data visualization slides with tables and charts.

```typescript
async function createDataVisualization(data) {
  const presentation = await create_presentation({
    title: "Data Analysis Report"
  });
  
  const presentationId = presentation.presentationId;
  
  // Create comparison table
  const tableSlide = await create_slide({
    presentationId,
    layout: "BLANK"
  });
  
  await add_text_box({
    presentationId,
    slideId: tableSlide.slideId,
    text: "Performance Comparison",
    x: 0.5,
    y: 0.5,
    width: 9,
    height: 0.75,
    fontSize: 28,
    bold: true
  });
  
  const table = await add_table({
    presentationId,
    slideId: tableSlide.slideId,
    rows: data.length + 1,
    columns: 4,
    x: 0.5,
    y: 1.5,
    width: 9,
    height: 3.5
  });
  
  // Populate table with batch update
  const tableRequests = [
    // Header row
    {
      insertText: {
        objectId: table.elementId,
        cellLocation: { rowIndex: 0, columnIndex: 0 },
        text: "Metric"
      }
    },
    {
      insertText: {
        objectId: table.elementId,
        cellLocation: { rowIndex: 0, columnIndex: 1 },
        text: "Q1"
      }
    },
    {
      insertText: {
        objectId: table.elementId,
        cellLocation: { rowIndex: 0, columnIndex: 2 },
        text: "Q2"
      }
    },
    {
      insertText: {
        objectId: table.elementId,
        cellLocation: { rowIndex: 0, columnIndex: 3 },
        text: "Change"
      }
    },
    // Data rows
    ...data.flatMap((row, idx) => [
      {
        insertText: {
          objectId: table.elementId,
          cellLocation: { rowIndex: idx + 1, columnIndex: 0 },
          text: row.metric
        }
      },
      {
        insertText: {
          objectId: table.elementId,
          cellLocation: { rowIndex: idx + 1, columnIndex: 1 },
          text: row.q1.toString()
        }
      },
      {
        insertText: {
          objectId: table.elementId,
          cellLocation: { rowIndex: idx + 1, columnIndex: 2 },
          text: row.q2.toString()
        }
      },
      {
        insertText: {
          objectId: table.elementId,
          cellLocation: { rowIndex: idx + 1, columnIndex: 3 },
          text: row.change
        }
      }
    ])
  ];
  
  await batch_update({
    presentationId,
    requests: tableRequests
  });
  
  return presentation;
}

// Usage
const dataReport = await createDataVisualization([
  { metric: "Revenue", q1: "$1.2M", q2: "$1.5M", change: "+25%" },
  { metric: "Users", q1: "10,500", q2: "13,200", change: "+26%" },
  { metric: "Conversion", q1: "3.2%", q2: "3.8%", change: "+19%" }
]);
```

---

## Template Automation

### Populate Template with Data

Fill a template presentation with dynamic data.

```typescript
async function populateTemplate(templateId, data) {
  // Copy the template
  const newPresentation = await copy_presentation({
    presentationId: templateId,
    newTitle: `${data.clientName} - ${data.projectName}`
  });
  
  const presentationId = newPresentation.newPresentationId;
  
  // Replace placeholder text
  await replace_all_text({
    presentationId,
    oldText: "{{CLIENT_NAME}}",
    newText: data.clientName,
    matchCase: false
  });
  
  await replace_all_text({
    presentationId,
    oldText: "{{PROJECT_NAME}}",
    newText: data.projectName,
    matchCase: false
  });
  
  await replace_all_text({
    presentationId,
    oldText: "{{DATE}}",
    newText: new Date().toLocaleDateString(),
    matchCase: false
  });
  
  await replace_all_text({
    presentationId,
    oldText: "{{BUDGET}}",
    newText: data.budget,
    matchCase: false
  });
  
  // Share with client
  await update_permissions({
    presentationId,
    email: data.clientEmail,
    role: "reader"
  });
  
  return newPresentation;
}

// Usage
const clientDeck = await populateTemplate(
  "template-presentation-id",
  {
    clientName: "Acme Corporation",
    projectName: "Website Redesign",
    budget: "$50,000",
    clientEmail: "client@acme.com"
  }
);
```

---

## Advanced Patterns

### Batch Creation for Efficiency

Create complex slides efficiently using batch operations.

```typescript
async function createComplexSlide(presentationId, slideId, content) {
  // Build all requests first
  const requests = [];
  
  // Add title
  const titleId = `title_${Date.now()}`;
  requests.push(
    {
      createShape: {
        objectId: titleId,
        shapeType: "TEXT_BOX",
        elementProperties: {
          pageObjectId: slideId,
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 457200,  // 0.5 inches
            translateY: 457200,
            unit: "EMU"
          }
        }
      }
    },
    {
      insertText: {
        objectId: titleId,
        text: content.title,
        insertionIndex: 0
      }
    },
    {
      updateTextStyle: {
        objectId: titleId,
        textRange: { type: "ALL" },
        style: {
          fontSize: { magnitude: 32, unit: "PT" },
          bold: true
        },
        fields: "fontSize,bold"
      }
    }
  );
  
  // Add multiple content elements
  content.elements.forEach((element, idx) => {
    const elementId = `element_${Date.now()}_${idx}`;
    const yPosition = 1.5 + (idx * 1.2);
    
    requests.push(
      {
        createShape: {
          objectId: elementId,
          shapeType: "TEXT_BOX",
          elementProperties: {
            pageObjectId: slideId,
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 914400,  // 1 inch
              translateY: yPosition * 914400,
              unit: "EMU"
            }
          }
        }
      },
      {
        insertText: {
          objectId: elementId,
          text: element.text,
          insertionIndex: 0
        }
      },
      {
        updateTextStyle: {
          objectId: elementId,
          textRange: { type: "ALL" },
          style: {
            fontSize: { magnitude: 16, unit: "PT" }
          },
          fields: "fontSize"
        }
      }
    );
  });
  
  // Execute all at once
  await batch_update({
    presentationId,
    requests
  });
}
```

---

### Error Handling Pattern

Robust error handling for production use.

```typescript
async function createPresentationWithRetry(title, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const presentation = await create_presentation({ title });
      console.log(`Presentation created successfully on attempt ${attempt}`);
      return presentation;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}

// Usage
try {
  const presentation = await createPresentationWithRetry("My Presentation");
  console.log(`Success: ${presentation.url}`);
} catch (error) {
  console.error("Failed to create presentation:", error);
  // Handle failure (notify user, log to monitoring, etc.)
}
```

---

## Need More Examples?

- 📚 [API Reference](./API_REFERENCE.md) - Detailed parameter documentation
- 🏠 [Main README](../README.md) - Getting started guide
- 💬 [Discussions](https://github.com/yourusername/google-slides-mcp/discussions) - Share your use cases
