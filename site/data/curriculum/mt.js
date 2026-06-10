window.NDTA_DATA=window.NDTA_DATA||{};window.NDTA_DATA['curriculum-mt']={
  "id": "mt",
  "code": "MT",
  "name": "Magnetic Particle Testing",
  "cp105": "ANSI/ASNT CP-105-2024 MT Topical Outlines",
  "hours": {
    "snt_tc_1a": { "l1": 12, "l2": 8 },
    "nas410": { "l1": 16, "l2": 16 },
    "directToL2": 32
  },
  "futureTechniques": [],
  "levels": [
    {
      "level": "I",
      "targetHours": 16,
      "description": "Foundational training in magnetic particle testing covering magnetism theory, circular and longitudinal magnetization, inspection materials, equipment, demagnetization, discontinuity origins, and the interpretation and documentation of indications. Structured to the ANSI/ASNT CP-105-2024 MT Level I topical outline with expanded hands-on technique practice to satisfy NAS 410 hour requirements.",
      "finalExam": { "questions": 50, "passingScore": 80, "bank": "MPI", "bankLevel": 1, "status": "placeholder" },
      "modules": [
        {
          "id": "mt1-1",
          "title": "Introduction to Magnetic Particle Testing",
          "cpSection": "1.0 Introduction",
          "hours": 2.0,
          "lessons": [
            {
              "id": "mt1-1-1",
              "title": "History and Purpose of NDT and MT",
              "minutes": 45,
              "objectives": [
                "Summarize the historical development of magnetic particle testing",
                "Explain the purpose of nondestructive testing in industry",
                "Identify the basic NDT methods and where MT fits among them"
              ],
              "topics": [
                "1.1 History of magnetic particle testing (MT)",
                "1.2 Purpose of NDT",
                "1.3 Overview of basic NDT methods"
              ],
              "media": [
                { "type": "video", "title": "From Hoke to Today: A Brief History of MT", "duration": "08:00", "status": "placeholder" },
                { "type": "diagram", "title": "The Major NDT Methods at a Glance", "status": "placeholder" },
                { "type": "narration", "title": "Why Industry Relies on NDT", "duration": "06:00", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt1-1-2",
              "title": "Certification and the MT Process Overview",
              "minutes": 45,
              "objectives": [
                "Describe the training, qualification, and certification process for MT personnel",
                "Outline the basic steps of a magnetic particle test from preparation through reporting"
              ],
              "topics": [
                "1.4 Training and certification process",
                "1.5 MT process overview"
              ],
              "media": [
                { "type": "video", "title": "Walkthrough of a Complete MT Inspection", "duration": "10:00", "status": "placeholder" },
                { "type": "diagram", "title": "Level I/II/III Qualification Path (SNT-TC-1A and NAS 410)", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt1-1-3",
              "title": "Advantages, Limitations, and Terminology",
              "minutes": 30,
              "objectives": [
                "List the principal advantages and limitations of the MT method",
                "Define core MT terminology used throughout the course"
              ],
              "topics": [
                "1.6 Advantages and limitations",
                "1.7 Terminology"
              ],
              "media": [
                { "type": "narration", "title": "When MT Is the Right Tool — and When It Is Not", "duration": "07:00", "status": "placeholder" },
                { "type": "reference", "title": "MT Glossary of Terms", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "mt1-2",
          "title": "Principles of Magnets and Magnetic Fields",
          "cpSection": "2.0 Principles of Magnets and Magnetic Fields",
          "hours": 2.5,
          "lessons": [
            {
              "id": "mt1-2-1",
              "title": "Theory of Magnetic Fields",
              "minutes": 60,
              "objectives": [
                "Describe the earth's magnetic field and fields produced by electrical current",
                "Sketch the magnetic field pattern around magnetized materials"
              ],
              "topics": [
                "2.1 Theory of magnetic fields",
                "2.1.1 Earth's magnetic field",
                "2.1.2 Electrical fields",
                "2.1.3 Magnetic fields around magnetized materials"
              ],
              "media": [
                { "type": "video", "title": "Visualizing Magnetic Fields", "duration": "09:00", "status": "placeholder" },
                { "type": "interactive", "title": "Field Line Explorer: Bar and Ring Magnets", "status": "placeholder" },
                { "type": "diagram", "title": "Field Around a Current-Carrying Conductor", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt1-2-2",
              "title": "Theory of Magnetism: Domains, Materials, and Flux",
              "minutes": 60,
              "objectives": [
                "Explain domain theory and classify materials as ferromagnetic, paramagnetic, or diamagnetic",
                "Define flux density and state the basic law of magnetism"
              ],
              "topics": [
                "2.2 Theory of magnetism",
                "2.2.1 Domain theory",
                "2.2.2 Materials",
                "2.2.3 Flux density",
                "2.2.4 Law of magnetism"
              ],
              "media": [
                { "type": "video", "title": "Domain Theory Explained", "duration": "08:00", "status": "placeholder" },
                { "type": "diagram", "title": "Magnetic Domains Before and After Magnetization", "status": "placeholder" },
                { "type": "simulation", "title": "Material Permeability Comparison", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt1-2-3",
              "title": "Field Properties, Flux Leakage, and Hysteresis",
              "minutes": 30,
              "objectives": [
                "Describe the properties of magnetic fields and the flux leakage principle that makes MT work",
                "Interpret a hysteresis loop and identify methods used to measure magnetic fields"
              ],
              "topics": [
                "2.2.5 Properties of magnetic fields",
                "2.2.6 Flux leakage",
                "2.2.7 Hysteresis of magnetism",
                "2.2.8 Measurement of fields"
              ],
              "media": [
                { "type": "diagram", "title": "Flux Leakage at a Surface Crack", "status": "placeholder" },
                { "type": "interactive", "title": "Hysteresis Loop Walkthrough", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "mt1-3",
          "title": "Material Preparation and Discontinuities",
          "cpSection": "3.0 Material Preparation and Discontinuities",
          "hours": 1.5,
          "lessons": [
            {
              "id": "mt1-3-1",
              "title": "Component Preparation and Precleaning",
              "minutes": 45,
              "objectives": [
                "Explain why component preparation is critical to a valid MT inspection",
                "Compare solvent, chemical, and mechanical precleaning methods and select the appropriate one"
              ],
              "topics": [
                "3.1 Component preparation",
                "3.2 Precleaning",
                "3.2.1 Solvent",
                "3.2.2 Chemical",
                "3.2.3 Mechanical"
              ],
              "media": [
                { "type": "video", "title": "Precleaning Methods Demonstration", "duration": "08:00", "status": "placeholder" },
                { "type": "reference", "title": "Precleaning Method Selection Chart", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt1-3-2",
              "title": "Coatings and Surface/Subsurface Discontinuities",
              "minutes": 45,
              "objectives": [
                "Describe the effect of coatings on MT sensitivity",
                "Differentiate surface from subsurface discontinuities and their typical MT response"
              ],
              "topics": [
                "3.3 Coatings",
                "3.4 Surface discontinuities",
                "3.5 Subsurface discontinuities"
              ],
              "media": [
                { "type": "diagram", "title": "Indication Strength vs. Discontinuity Depth", "status": "placeholder" },
                { "type": "video", "title": "Surface vs. Subsurface Indications Side by Side", "duration": "07:00", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "mt1-4",
          "title": "Magnetization Techniques and Field Sources",
          "cpSection": "4.0 Circular Magnetism; 5.0 Longitudinal Magnetism; 6.0 Sources of Magnetic Fields",
          "hours": 4.0,
          "lessons": [
            {
              "id": "mt1-4-1",
              "title": "Circular Magnetization",
              "minutes": 75,
              "objectives": [
                "Apply the right-hand rule to determine field direction in a straight conductor and in parts",
                "Distinguish direct from indirect magnetic induction and predict indication geometry",
                "Describe methods of detecting circular field strength and the advantages/disadvantages of circular magnetization"
              ],
              "topics": [
                "4.1 Field produced in a straight conductor",
                "4.2 Field within materials",
                "4.2.1 Right-hand rule",
                "4.2.2 Fields in materials",
                "4.2.3 Indication geometry",
                "4.3 Direct magnetic induction",
                "4.4 Indirect magnetic induction",
                "4.5 Strength of fields",
                "4.6 Field detection",
                "4.7 Advantages/disadvantages"
              ],
              "media": [
                { "type": "video", "title": "Headshot and Central Conductor Techniques", "duration": "12:00", "status": "placeholder" },
                { "type": "interactive", "title": "Right-Hand Rule Trainer", "status": "placeholder" },
                { "type": "diagram", "title": "Circular Field and Detectable Flaw Orientations", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt1-4-2",
              "title": "Longitudinal Magnetization",
              "minutes": 75,
              "objectives": [
                "Explain how a coil produces a longitudinal field and how that field behaves within materials",
                "Predict indication geometry for longitudinally magnetized parts",
                "Summarize field strength factors, detection methods, and advantages/disadvantages of longitudinal magnetization"
              ],
              "topics": [
                "5.1 Field produced by coil",
                "5.2 Field within materials",
                "5.2.1 Magnetic field induction",
                "5.2.2 Fields in materials",
                "5.2.3 Indication geometry",
                "5.3 Strength of fields",
                "5.4 Field detection",
                "5.5 Advantages/disadvantages"
              ],
              "media": [
                { "type": "video", "title": "Coil Shot Demonstration", "duration": "10:00", "status": "placeholder" },
                { "type": "diagram", "title": "Longitudinal Field and Detectable Flaw Orientations", "status": "placeholder" },
                { "type": "simulation", "title": "Coil Field Strength vs. Part Position", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt1-4-3",
              "title": "Sources of Magnetic Fields and Magnetizing Current",
              "minutes": 45,
              "objectives": [
                "Identify permanent magnets and electromagnetic sources used in MT",
                "Compare direct and alternating magnetizing currents and their advantages and disadvantages"
              ],
              "topics": [
                "6.1 Magnets",
                "6.2 Types of magnetizing current",
                "6.2.1 Direct current",
                "6.2.2 Alternating current",
                "6.2.3 Advantages/disadvantages"
              ],
              "media": [
                { "type": "narration", "title": "AC vs. DC: Depth of Penetration and Particle Mobility", "duration": "08:00", "status": "placeholder" },
                { "type": "diagram", "title": "Current Waveforms Used in MT", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt1-4-4",
              "title": "Technique Practice: Choosing and Applying Field Direction",
              "minutes": 45,
              "objectives": [
                "Select circular or longitudinal magnetization for given part geometries and expected flaw orientations",
                "Practice verifying field direction and adequacy on sample scenarios"
              ],
              "topics": [
                "4.2.3 Indication geometry (applied practice)",
                "4.6 Field detection (applied practice)",
                "5.2.3 Indication geometry (applied practice)",
                "5.4 Field detection (applied practice)",
                "6.2 Types of magnetizing current (applied practice)"
              ],
              "media": [
                { "type": "simulation", "title": "Virtual Bench: Field Direction Selection Scenarios", "status": "placeholder" },
                { "type": "interactive", "title": "Flaw Orientation vs. Field Direction Matching Exercise", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "mt1-5",
          "title": "Inspection Materials, Demagnetization, and Equipment",
          "cpSection": "7.0 Inspection Materials; 8.0 Principles of Demagnetization; 9.0 Equipment",
          "hours": 3.5,
          "lessons": [
            {
              "id": "mt1-5-1",
              "title": "Inspection Materials: Wet and Dry Particles",
              "minutes": 45,
              "objectives": [
                "Compare wet and dry magnetic particles and their typical uses",
                "Demonstrate correct particle application techniques"
              ],
              "topics": [
                "7.1 Wet particles",
                "7.2 Dry particles",
                "7.3 Application of particles"
              ],
              "media": [
                { "type": "video", "title": "Wet Bath and Dry Powder Application Techniques", "duration": "09:00", "status": "placeholder" },
                { "type": "reference", "title": "Particle Selection Quick Guide", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt1-5-2",
              "title": "Principles of Demagnetization",
              "minutes": 60,
              "objectives": [
                "Explain residual magnetism and the reasons demagnetization may be required",
                "Describe demagnetization methods and how results are verified",
                "Relate retentivity and coercive force to a part's demagnetization difficulty"
              ],
              "topics": [
                "8.1 Residual magnetism",
                "8.2 Reasons for demagnetization",
                "8.3 Longitudinal and circular residual fields",
                "8.4 Basic principles of demagnetization",
                "8.5 Residual and coercive force",
                "8.6 Methods of demagnetization",
                "8.7 Measurement of results"
              ],
              "media": [
                { "type": "video", "title": "Demagnetizing with AC Coil and Reversing DC", "duration": "10:00", "status": "placeholder" },
                { "type": "diagram", "title": "Diminishing Hysteresis Loops During Demagnetization", "status": "placeholder" },
                { "type": "interactive", "title": "Field Indicator Reading Practice", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt1-5-3",
              "title": "Equipment Selection and Types",
              "minutes": 45,
              "objectives": [
                "List the considerations that drive MT equipment selection",
                "Differentiate stationary, mobile, portable, multidirectional, automatic, and demagnetization equipment"
              ],
              "topics": [
                "9.1 Equipment selection considerations",
                "9.1.1 Type of magnetizing current",
                "9.1.2 Location and nature of test",
                "9.1.3 Test materials",
                "9.1.4 Purpose of test",
                "9.1.5 Area inspected",
                "9.2 Stationary equipment",
                "9.3 Mobile equipment",
                "9.4 Portable equipment",
                "9.5 Multidirectional equipment",
                "9.6 Automatic equipment",
                "9.7 Demagnetization equipment"
              ],
              "media": [
                { "type": "video", "title": "Tour of MT Equipment: Bench Units to Yokes", "duration": "10:00", "status": "placeholder" },
                { "type": "diagram", "title": "Equipment Selection Decision Tree", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt1-5-4",
              "title": "Light Sources, Field Measurement, and Consumables",
              "minutes": 60,
              "objectives": [
                "Describe white light, UV-A, and ambient light requirements and how each is measured",
                "Identify field direction and strength measurement devices",
                "Compare visible and fluorescent particles and explain bath properties and concentration checks"
              ],
              "topics": [
                "9.8 Light sources",
                "9.8.1 White light",
                "9.8.2 UV-A light",
                "9.8.3 Ambient light",
                "9.8.4 Measurement devices",
                "9.9 Field measurement devices",
                "9.9.1 Field direction",
                "9.9.2 Field strength",
                "9.10 Materials",
                "9.10.1 Visible particles",
                "9.10.2 Fluorescent particles",
                "9.10.3 Wet versus dry",
                "9.10.4 Bath properties and concentrations",
                "9.10.5 Portable materials"
              ],
              "media": [
                { "type": "video", "title": "Using Light Meters and Field Indicators", "duration": "09:00", "status": "placeholder" },
                { "type": "interactive", "title": "Settling Test: Reading the Centrifuge Tube", "status": "placeholder" },
                { "type": "reference", "title": "Typical Light Intensity and Bath Concentration Limits", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "mt1-6",
          "title": "Method Selection, Discontinuity Origins, and Interpretation",
          "cpSection": "10.0 Selecting Proper Methods of Magnetization; 11.0 Product and Flaw Stages; 12.0 MT Indications and Interpretations",
          "hours": 3.5,
          "lessons": [
            {
              "id": "mt1-6-1",
              "title": "Procedures, Written Instructions, and Industry Standards",
              "minutes": 45,
              "objectives": [
                "Explain the role of procedures and written instructions in selecting magnetization methods",
                "Identify common industry standards applied to welds, pipe, aerospace, and other applications"
              ],
              "topics": [
                "10.1 Procedure and written instructions",
                "10.2 Industry standards",
                "10.2.1 Welds",
                "10.2.2 Pipe",
                "10.2.3 Aerospace",
                "10.2.4 Other users"
              ],
              "media": [
                { "type": "reference", "title": "Sample MT Technique Sheet (Generic)", "status": "placeholder" },
                { "type": "narration", "title": "How Codes and Standards Shape an Inspection", "duration": "08:00", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt1-6-2",
              "title": "Product and Flaw Stages",
              "minutes": 60,
              "objectives": [
                "Classify discontinuities by origin: inherent, primary processing, secondary processing, and in-service",
                "Recognize the discontinuity types detectable by MT, from inclusions to forging bursts and voids"
              ],
              "topics": [
                "11.1 Inherent stage",
                "11.2 Primary processing stage",
                "11.3 Secondary processing stage",
                "11.4 In-service stage",
                "11.5 Types of discontinuities detected by MT",
                "11.5.1 Inclusions",
                "11.5.2 Blowholes",
                "11.5.3 Porosity",
                "11.5.4 Flakes",
                "11.5.5 Cracks",
                "11.5.6 Pipes",
                "11.5.7 Laminations",
                "11.5.8 Laps",
                "11.5.9 Forging bursts",
                "11.5.10 Voids"
              ],
              "media": [
                { "type": "video", "title": "Where Flaws Come From: Mill to Service", "duration": "11:00", "status": "placeholder" },
                { "type": "diagram", "title": "Discontinuity Origin Map by Manufacturing Stage", "status": "placeholder" },
                { "type": "interactive", "title": "Match the Discontinuity to Its Stage", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt1-6-3",
              "title": "Indications and Interpretation",
              "minutes": 60,
              "objectives": [
                "Describe human factors, viewing conditions, and lighting requirements that affect interpretation",
                "Distinguish relevant from nonrelevant indications and surface from subsurface indications"
              ],
              "topics": [
                "12.1 Human factors",
                "12.2 View conditions",
                "12.3 Continuity of inspection",
                "12.4 Lighting",
                "12.5 Component use and condition",
                "12.6 Purpose of test",
                "12.7 Interpretation of indication",
                "12.7.1 Relevant versus nonrelevant",
                "12.7.2 Surface versus subsurface indications"
              ],
              "media": [
                { "type": "video", "title": "Reading Indications Under UV-A", "duration": "09:00", "status": "placeholder" },
                { "type": "interactive", "title": "Relevant or Nonrelevant? Indication Gallery", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt1-6-4",
              "title": "Evaluation, Postcleaning, and Documentation Workshop",
              "minutes": 45,
              "objectives": [
                "Apply acceptance/rejection criteria to example indications",
                "Complete postcleaning, protection, and documentation steps for a finished inspection"
              ],
              "topics": [
                "12.8 Evaluation",
                "12.8.1 Criteria",
                "12.8.2 Acceptance/rejection",
                "12.9 Postcleaning and protection",
                "12.10 Documentation of test"
              ],
              "media": [
                { "type": "simulation", "title": "Evaluation Workshop: Accept, Reject, or Rework", "status": "placeholder" },
                { "type": "reference", "title": "MT Inspection Report Template", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        }
      ]
    },
    {
      "level": "II",
      "targetHours": 16,
      "description": "Advanced magnetic particle testing covering flux theory and current calculations, magnetization technique selection, demagnetization, equipment capabilities, discontinuity recognition in product forms, interpretation and evaluation, procedure development, and process quality control. Structured to the ANSI/ASNT CP-105-2024 MT Level II topical outline with additional applied workshops to satisfy NAS 410 hour requirements.",
      "finalExam": { "questions": 50, "passingScore": 80, "bank": "MPI", "bankLevel": 2, "status": "placeholder" },
      "modules": [
        {
          "id": "mt2-1",
          "title": "Level I Review",
          "cpSection": "1.0 Review",
          "hours": 2.0,
          "lessons": [
            {
              "id": "mt2-1-1",
              "title": "Principles, Process, and Equipment Review",
              "minutes": 60,
              "objectives": [
                "Restate the basic principles of magnetism and the magnetic particle process",
                "Review the categories of MT equipment and their typical applications"
              ],
              "topics": [
                "1.1 Basic principles",
                "1.2 Basic magnetic particle process",
                "1.3 Equipment"
              ],
              "media": [
                { "type": "video", "title": "Level I in 15 Minutes: The Essentials", "duration": "15:00", "status": "placeholder" },
                { "type": "interactive", "title": "Rapid-Fire Review: Fields, Currents, and Equipment", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt2-1-2",
              "title": "Terminology, Test Factors, Safety, and Certification",
              "minutes": 60,
              "objectives": [
                "Use standard MT terminology correctly in technical communication",
                "Identify the test factors and safety considerations that influence MT results",
                "Recognize toxicity and flammability hazards of MT materials and vehicles",
                "Summarize Level II responsibilities within the training and certification framework"
              ],
              "topics": [
                "1.4 Terminology",
                "1.5 Test factors",
                "1.6 Safety",
                "6.1 Toxicity",
                "6.3 Flammability",
                "1.7 Training and certification processes"
              ],
              "media": [
                { "type": "narration", "title": "Safety in the MT Booth: Electrical, UV, and Materials", "duration": "08:00", "status": "placeholder" },
                { "type": "reference", "title": "MT Terminology and Test Factor Checklist", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "mt2-2",
          "title": "Advanced Principles and Magnetization by Electric Current",
          "cpSection": "2.0 Principles (2.1-2.5)",
          "hours": 4.75,
          "lessons": [
            {
              "id": "mt2-2-1",
              "title": "Flux Theory and Current Calculations",
              "minutes": 75,
              "objectives": [
                "Analyze flux patterns and the influence of frequency and voltage on the induced field",
                "Perform current calculations for common part geometries",
                "Relate surface flux strength to subsurface effects"
              ],
              "topics": [
                "2.1 Theory",
                "2.1.1 Flux patterns",
                "2.1.2 Frequency and voltage factors",
                "2.1.3 Current calculations",
                "2.1.4 Surface flux strength",
                "2.1.5 Subsurface effects"
              ],
              "media": [
                { "type": "video", "title": "Calculating Amperage: Diameter and L/D Rules", "duration": "12:00", "status": "placeholder" },
                { "type": "interactive", "title": "Current Calculation Practice Problems", "status": "placeholder" },
                { "type": "diagram", "title": "Flux Pattern Cross Sections for AC and DC", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt2-2-2",
              "title": "Magnetism Behavior and Flux Fields from DC, Pulsed DC, and AC",
              "minutes": 75,
              "objectives": [
                "Explain distance, heat, and hardness effects on magnetic behavior and retention",
                "Describe the action of flux at a discontinuity",
                "Compare DC, direct pulsating, and AC flux fields including penetration, safety, and source considerations"
              ],
              "topics": [
                "2.2 Magnets and magnetism",
                "2.2.1 Distance factors versus strength of flux",
                "2.2.2 Internal and external flux patterns",
                "2.2.3 Phenomenon action at the discontinuity",
                "2.2.4 Heat effects on magnetism",
                "2.2.5 Material hardness versus magnetic retention",
                "2.3 Flux fields",
                "2.3.1 Direct current",
                "2.3.1.1 Depth of penetration factors",
                "2.3.1.2 Source of current",
                "2.3.2 Direct pulsating current",
                "2.3.2.1 Similarity to direct current",
                "2.3.2.2 Advantages",
                "2.3.2.3 Typical fields",
                "2.3.3 Alternating current",
                "2.3.3.1 Cyclic effects",
                "2.3.3.2 Surface strength characteristics",
                "2.3.3.3 Safety precautions",
                "2.3.3.4 Voltage and current factors",
                "2.3.3.5 Source of current"
              ],
              "media": [
                { "type": "video", "title": "Current Types Compared on Real Indications", "duration": "10:00", "status": "placeholder" },
                { "type": "simulation", "title": "Penetration Depth vs. Current Type Explorer", "status": "placeholder" },
                { "type": "diagram", "title": "Curie Point and Heat Effects on Magnetism", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt2-2-3",
              "title": "Effects of Discontinuities on Materials",
              "minutes": 45,
              "objectives": [
                "Relate design factors and part use to the significance of a discontinuity",
                "Explain how discontinuities affect load-carrying ability and behavior under cyclic loading"
              ],
              "topics": [
                "2.4 Effects of discontinuities on materials",
                "2.4.1 Design factors",
                "2.4.1.1 Mechanical properties",
                "2.4.1.2 Part use",
                "2.4.2 Relationship to load-carrying ability",
                "2.4.3 Cyclic loading issues"
              ],
              "media": [
                { "type": "narration", "title": "Why a Small Crack Matters: Stress Concentration and Fatigue", "duration": "08:00", "status": "placeholder" },
                { "type": "diagram", "title": "Crack Growth Under Cyclic Loading", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt2-2-4",
              "title": "Circular and Longitudinal Magnetization Techniques",
              "minutes": 90,
              "objectives": [
                "Determine current values, depth factors, and safety precautions for circular techniques using prods and plates",
                "Describe the field produced in parts through which current flows and the methods of inducing current flow in parts",
                "Apply coil and cable techniques, including field strength determination and current measurement",
                "Identify the discontinuities commonly detected by each technique and by yokes"
              ],
              "topics": [
                "2.5 Magnetization by means of electric current",
                "2.5.1 Circular techniques",
                "2.5.1.1 Current determinations",
                "2.5.1.2 Depth-factor considerations",
                "2.5.1.3 Precautions - safety and overheating",
                "2.5.1.4 Contact prods and plates",
                "2.5.1.4.1 Requirements for prods and plates",
                "2.5.1.4.2 Current-carrying capabilities",
                "2.5.1.5 Discontinuities commonly detected",
                "3.1.1.3 Field in parts through which current flows",
                "3.1.1.4 Methods of inducing current flow in parts",
                "2.5.2 Longitudinal technique",
                "2.5.2.1 Principles of induced flux fields",
                "2.5.2.2 Geometry of part to be inspected",
                "2.5.2.3 Shapes and sizes of coils",
                "2.5.2.4 Use of coils and cables",
                "2.5.2.4.1 Strength of field",
                "2.5.2.4.2 Current directional flow versus flux field",
                "2.5.2.4.3 Shapes, sizes, and current capacities",
                "2.5.2.5 Determining proper current",
                "2.5.2.5.1 Types of current required",
                "2.5.2.5.2 Current evaluation",
                "2.5.2.5.3 Measuring current",
                "2.5.2.6 Yokes",
                "2.5.2.7 Discontinuities commonly detected"
              ],
              "media": [
                { "type": "video", "title": "Prods, Coils, Cables, and Yokes in Practice", "duration": "14:00", "status": "placeholder" },
                { "type": "interactive", "title": "Coil Shot Amperage Calculator Workshop", "status": "placeholder" },
                { "type": "diagram", "title": "Prod Spacing and Current Requirements", "status": "placeholder" },
                { "type": "reference", "title": "Technique Setup Cheat Sheet: Circular vs. Longitudinal", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "mt2-3",
          "title": "Method Selection and Demagnetization",
          "cpSection": "2.6 Selecting the Proper Method of Magnetization; 3.0 Principles of Demagnetization",
          "hours": 2.75,
          "lessons": [
            {
              "id": "mt2-3-1",
              "title": "Selecting the Proper Method of Magnetization",
              "minutes": 45,
              "objectives": [
                "Select the magnetization method based on alloy, shape, and condition of the part",
                "Justify choices of current type, field direction, operation sequence, and flux density"
              ],
              "topics": [
                "2.6 Selecting the proper method of magnetization",
                "2.6.1 Alloy, shape, and condition of part",
                "2.6.2 Type of magnetizing current",
                "2.6.3 Direction of magnetic field",
                "2.6.4 Sequence of operations",
                "2.6.5 Value of flux density"
              ],
              "media": [
                { "type": "diagram", "title": "Method Selection Decision Matrix", "status": "placeholder" },
                { "type": "narration", "title": "Thinking Like a Level II: Building a Magnetization Plan", "duration": "08:00", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt2-3-2",
              "title": "Demagnetization Principles, Methods, and Verification",
              "minutes": 60,
              "objectives": [
                "Explain residual longitudinal and circular fields and the reasons demagnetization is required",
                "Compare demagnetization methods and verify results with appropriate measurement devices"
              ],
              "topics": [
                "3.1 Residual magnetism",
                "3.2 Reasons for demagnetization",
                "3.3 Longitudinal and circular residual fields",
                "3.4 Basic principles of demagnetization",
                "3.5 Residual and coercive force",
                "3.6 Methods of demagnetization",
                "3.7 Measurement of results"
              ],
              "media": [
                { "type": "video", "title": "Demagnetization Methods and Verification", "duration": "10:00", "status": "placeholder" },
                { "type": "interactive", "title": "Residual Field Troubleshooting Scenarios", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt2-3-3",
              "title": "Applied Technique Workshop: Magnetization Planning",
              "minutes": 60,
              "objectives": [
                "Develop complete magnetization and demagnetization plans for representative parts",
                "Defend technique choices including current values, field directions, and sequence of operations"
              ],
              "topics": [
                "2.5 Magnetization by means of electric current (applied practice)",
                "2.6 Selecting the proper method of magnetization (applied practice)",
                "3.6 Methods of demagnetization (applied practice)"
              ],
              "media": [
                { "type": "simulation", "title": "Virtual Bench: Plan and Execute a Two-Direction Inspection", "status": "placeholder" },
                { "type": "reference", "title": "Worked Examples: Shaft, Weldment, and Ring Gear", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "mt2-4",
          "title": "Equipment, Materials, and Light Sources",
          "cpSection": "4.0 Equipment",
          "hours": 2.75,
          "lessons": [
            {
              "id": "mt2-4-1",
              "title": "Portable, Mobile, and Stationary Equipment",
              "minutes": 60,
              "objectives": [
                "Compare the reasons for and capabilities of portable, mobile, and stationary MT equipment",
                "Describe automation requirements, sequential operations, controls, and alarm/rejection mechanisms"
              ],
              "topics": [
                "4.1 Portable equipment",
                "4.1.1 Reason for portable equipment",
                "4.1.2 Capabilities of portable equipment",
                "4.1.3 Similarity to stationary equipment",
                "4.2 Mobile equipment",
                "4.2.1 Reason for mobile equipment",
                "4.2.2 Capabilities of mobile equipment",
                "4.2.3 Similarity to stationary equipment",
                "4.3 Stationary equipment",
                "4.3.1 Requirements for automation",
                "4.3.2 Sequential operations",
                "4.3.3 Control and operation factors",
                "4.3.4 Alarm and rejection mechanisms"
              ],
              "media": [
                { "type": "video", "title": "Equipment Classes: Field Kit to Automated Bench", "duration": "11:00", "status": "placeholder" },
                { "type": "diagram", "title": "Stationary Unit Control and Sequencing Schematic", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt2-4-2",
              "title": "Multidirectional Equipment, Liquids, and Powders",
              "minutes": 60,
              "objectives": [
                "Explain multidirectional magnetization capabilities, sequencing, controls, and applications",
                "Describe particle vehicle requirements, mixing procedures, proportions, and bath-strength factors"
              ],
              "topics": [
                "4.4 Multidirectional equipment",
                "4.4.1 Capabilities",
                "4.4.2 Sequential operations",
                "4.4.3 Control and operation factors",
                "4.4.4 Applications",
                "4.5 Liquids and powders",
                "4.5.1 Liquid requirements as a particle vehicle",
                "4.5.2 Safety precautions",
                "4.5.3 Temperature needs",
                "4.5.4 Powder and paste contents",
                "4.5.5 Mixing procedures",
                "4.5.6 Need for accurate proportions",
                "4.5.7 Bath-strength factors and strength quality"
              ],
              "media": [
                { "type": "video", "title": "Mixing and Maintaining a Wet Bath", "duration": "09:00", "status": "placeholder" },
                { "type": "simulation", "title": "Multidirectional Field Sequencing Visualizer", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt2-4-3",
              "title": "Light Sources, Measurement, and Safety",
              "minutes": 45,
              "objectives": [
                "Specify white light, UV-A, and ambient light requirements for visible and fluorescent inspection",
                "Use light measurement devices correctly and apply UV safety practices"
              ],
              "topics": [
                "4.6 Light sources",
                "4.6.1 White light",
                "4.6.2 UV-A light",
                "4.6.3 Ambient light",
                "4.6.4 Measurement devices",
                "4.6.5 Safety"
              ],
              "media": [
                { "type": "video", "title": "Verifying UV-A and Ambient Light Levels", "duration": "07:00", "status": "placeholder" },
                { "type": "reference", "title": "Lighting Requirements Summary Table", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "mt2-5",
          "title": "Discontinuities, Interpretation, Procedures, and Quality Control",
          "cpSection": "5.0 Types of Discontinuities; 6.0 MT Indications and Interpretations; 7.0 Procedure Development; 8.0 Quality Control of Equipment and Processes",
          "hours": 5.0,
          "lessons": [
            {
              "id": "mt2-5-1",
              "title": "Types of Discontinuities by Product Form",
              "minutes": 60,
              "objectives": [
                "Identify the discontinuities characteristic of castings, ingots, wrought sections, and welds",
                "Predict the MT appearance of each discontinuity type"
              ],
              "topics": [
                "5.1 In castings",
                "5.2 In ingots",
                "5.3 In wrought sections and parts",
                "5.4 In welds"
              ],
              "media": [
                { "type": "video", "title": "Discontinuity Gallery by Product Form", "duration": "12:00", "status": "placeholder" },
                { "type": "interactive", "title": "Name That Discontinuity: Casting, Wrought, or Weld?", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt2-5-2",
              "title": "Indications, Interpretation, and Evaluation",
              "minutes": 75,
              "objectives": [
                "Apply human factors, viewing conditions, and lighting requirements to interpretation decisions",
                "Classify indications as relevant, nonrelevant, surface, or subsurface and evaluate them against criteria",
                "Complete postcleaning, protection, and documentation requirements"
              ],
              "topics": [
                "6.1 Human factors",
                "6.2 Continuity of inspection",
                "6.3 View conditions",
                "6.4 Lighting",
                "6.5 Component use and condition",
                "6.6 Purpose of test",
                "6.7 Interpretation of indication",
                "6.7.1 Relevant versus nonrelevant",
                "6.7.2 Surface versus subsurface indications",
                "6.8 Evaluation",
                "6.8.1 Criteria",
                "6.8.2 Acceptance/rejection",
                "6.9 Postcleaning and protection",
                "6.10 Documentation of test"
              ],
              "media": [
                { "type": "simulation", "title": "Interpretation Workshop: 20 Indications to Disposition", "status": "placeholder" },
                { "type": "video", "title": "Evaluating Against Acceptance Criteria", "duration": "10:00", "status": "placeholder" },
                { "type": "reference", "title": "Indication Disposition and Reporting Form", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt2-5-3",
              "title": "Procedure Development",
              "minutes": 60,
              "objectives": [
                "Use standards and references (e.g., ASTM, ASME) when developing MT procedures",
                "Incorporate part history, manufacturing process, defect causes, usage, and acceptance criteria into a procedure",
                "Apply tolerances and validation processes to qualify a procedure"
              ],
              "topics": [
                "7.1 Use of standards (e.g., ASTM, ASME)",
                "7.2 Need for standards and references",
                "7.3 Part considerations",
                "7.3.1 History of part",
                "7.3.2 Manufacturing process",
                "7.3.3 Possible causes of defect",
                "7.3.4 Usage of part",
                "7.3.5 Acceptance/rejection criteria",
                "7.4 Use of tolerances",
                "7.5 Validation processes"
              ],
              "media": [
                { "type": "video", "title": "Drafting an MT Technique Card Step by Step", "duration": "12:00", "status": "placeholder" },
                { "type": "reference", "title": "Procedure Development Worksheet", "status": "placeholder" },
                { "type": "interactive", "title": "Procedure Gap-Finding Exercise", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt2-5-4",
              "title": "Quality Control of Equipment and Processes",
              "minutes": 60,
              "objectives": [
                "Perform settling tests and other bath-strength checks and maintain the particle vehicle",
                "Verify UV and white light intensity and validate field strength and residual fields with appropriate devices",
                "Schedule and document equipment preventive maintenance"
              ],
              "topics": [
                "8.1 Equipment preventive maintenance",
                "8.2 Vehicle bath maintenance and strength checks",
                "8.2.1 Settling test process",
                "8.2.2 Other bath-strength tests",
                "8.3 Lighting intensity checks",
                "8.3.1 UV light",
                "8.3.2 White light",
                "8.4 Field strength validation devices",
                "8.5 Residual field checking devices"
              ],
              "media": [
                { "type": "video", "title": "Daily and Periodic System Checks Demonstration", "duration": "10:00", "status": "placeholder" },
                { "type": "simulation", "title": "Process Control Lab: Run the Daily QC Routine", "status": "placeholder" },
                { "type": "reference", "title": "QC Check Frequency and Tolerance Table", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "mt2-5-5",
              "title": "Writing the MT Procedure: Required Content",
              "minutes": 45,
              "objectives": [
                "Structure a written MT procedure from foreword through recording of results",
                "Specify the apparatus and settings, product description, and test conditions in a procedure",
                "Write detailed application instructions and define how results are recorded and classified"
              ],
              "topics": [
                "5.1 Foreword (scope, reference documents)",
                "5.3 Apparatus to be used, including settings",
                "5.4 Product (description or drawing, including area to be tested)",
                "5.5 Test conditions, including preparation for testing",
                "5.6 Detailed instructions for application of the test",
                "5.7 Recording and classifying the results of the test"
              ],
              "media": [
                { "type": "video", "title": "Building an MT Procedure Section by Section", "duration": "10:00", "status": "placeholder" },
                { "type": "reference", "title": "Annotated Model MT Procedure", "status": "placeholder" },
                { "type": "interactive", "title": "Procedure Section Builder Exercise", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        }
      ]
    }
  ]
}
;