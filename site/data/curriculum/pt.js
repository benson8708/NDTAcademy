window.NDTA_DATA=window.NDTA_DATA||{};window.NDTA_DATA['curriculum-pt']={
  "id": "pt",
  "code": "PT",
  "name": "Liquid Penetrant Testing",
  "cp105": "ANSI/ASNT CP-105-2024 PT Topical Outlines",
  "hours": {
    "snt_tc_1a": { "l1": 4, "l2": 8 },
    "nas410": { "l1": 16, "l2": 16 },
    "directToL2": 32
  },
  "futureTechniques": [],
  "levels": [
    {
      "level": "I",
      "targetHours": 16,
      "description": "Foundational training in liquid penetrant testing covering capillary-action principles, the full processing sequence from precleaning through postcleaning, the standard ASTM/ASME penetrant methods, and PT equipment, lighting, and materials. Structured to the ANSI/ASNT CP-105-2024 PT Level I topical outline with extensive guided processing practice to satisfy NAS 410 hour requirements.",
      "finalExam": { "questions": 50, "passingScore": 80, "bank": "LPI", "bankLevel": 1, "status": "placeholder" },
      "modules": [
        {
          "id": "pt1-1",
          "title": "Introduction to Liquid Penetrant Testing",
          "cpSection": "1.0 Introduction",
          "hours": 2.5,
          "lessons": [
            {
              "id": "pt1-1-1",
              "title": "History and Purpose of NDT and PT",
              "minutes": 45,
              "objectives": [
                "Summarize the historical development of nondestructive testing and liquid penetrant testing",
                "Explain the purpose of PT and the types of discontinuities it can reveal"
              ],
              "topics": [
                "1.1 Brief history of nondestructive testing and liquid penetrant testing (PT)",
                "1.2 Purpose of PT"
              ],
              "media": [
                { "type": "video", "title": "From Oil-and-Whiting to Fluorescent Penetrants", "duration": "08:00", "status": "placeholder" },
                { "type": "narration", "title": "What PT Finds and Why It Matters", "duration": "06:00", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt1-1-2",
              "title": "Basic Principles of PT: Capillary Action",
              "minutes": 60,
              "objectives": [
                "Explain capillary action, surface wetting, and how penetrants enter and exit discontinuities",
                "Relate dwell time, surface tension, and viscosity to indication formation"
              ],
              "topics": [
                "1.3 Basic principles of PT"
              ],
              "media": [
                { "type": "video", "title": "Capillary Action Demonstrated", "duration": "09:00", "status": "placeholder" },
                { "type": "interactive", "title": "Penetrant Entry and Bleed-Out Visualizer", "status": "placeholder" },
                { "type": "diagram", "title": "Wetting, Contact Angle, and Capillary Forces", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt1-1-3",
              "title": "Penetrant Types and Personnel Qualification",
              "minutes": 45,
              "objectives": [
                "Identify the types of liquid penetrants commercially available (Type 1 fluorescent, Type 2 visible) and their removal methods",
                "Describe the method of personnel qualification and certification for PT"
              ],
              "topics": [
                "1.4 Types of liquid penetrants commercially available",
                "1.5 Method of personnel qualification"
              ],
              "media": [
                { "type": "diagram", "title": "Penetrant Type, Method, and Sensitivity Level Classification", "status": "placeholder" },
                { "type": "reference", "title": "PT Personnel Qualification Path (SNT-TC-1A and NAS 410)", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "pt1-2",
          "title": "Penetrant Processing: Preparation Through Removal",
          "cpSection": "2.0 Liquid Penetrant Processing (2.1-2.4)",
          "hours": 4.25,
          "lessons": [
            {
              "id": "pt1-2-1",
              "title": "Preparation of Parts and Adequate Lighting",
              "minutes": 60,
              "objectives": [
                "Prepare part surfaces correctly, recognizing contaminants that block penetrant entry",
                "Verify adequate white light or UV-A lighting before processing and inspection"
              ],
              "topics": [
                "2.1 Preparation of parts",
                "2.2 Adequate lighting"
              ],
              "media": [
                { "type": "video", "title": "Precleaning for PT: Methods and Pitfalls", "duration": "09:00", "status": "placeholder" },
                { "type": "diagram", "title": "Contaminants That Defeat Penetrant Entry", "status": "placeholder" },
                { "type": "reference", "title": "Lighting Requirements for Visible and Fluorescent PT", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt1-2-2",
              "title": "Penetrant Application and Dwell",
              "minutes": 60,
              "objectives": [
                "Apply penetrant by spray, brush, and immersion while maintaining surface coverage",
                "Select appropriate dwell times based on material, temperature, and suspected discontinuity type"
              ],
              "topics": [
                "2.3 Application of penetrant to parts"
              ],
              "media": [
                { "type": "video", "title": "Applying Penetrant: Spray, Brush, and Dip", "duration": "08:00", "status": "placeholder" },
                { "type": "interactive", "title": "Dwell Time Decision Practice", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt1-2-3",
              "title": "Removal of Surface Penetrant",
              "minutes": 60,
              "objectives": [
                "Remove excess surface penetrant by water-wash, solvent-wipe, and emulsifier techniques",
                "Recognize and avoid overwashing and underwashing conditions"
              ],
              "topics": [
                "2.4 Removal of surface penetrant"
              ],
              "media": [
                { "type": "video", "title": "Wash Station Technique Under UV-A", "duration": "09:00", "status": "placeholder" },
                { "type": "simulation", "title": "Overwash vs. Underwash: Spot the Difference", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt1-2-4",
              "title": "Guided Practice: Preparation, Application, and Removal",
              "minutes": 75,
              "objectives": [
                "Execute the preparation, application, and removal steps in sequence on practice scenarios",
                "Identify processing errors and their effect on indication quality"
              ],
              "topics": [
                "2.1 Preparation of parts (applied practice)",
                "2.2 Adequate lighting (applied practice)",
                "2.3 Application of penetrant to parts (applied practice)",
                "2.4 Removal of surface penetrant (applied practice)"
              ],
              "media": [
                { "type": "simulation", "title": "Virtual Penetrant Line: Preclean to Wash", "status": "placeholder" },
                { "type": "interactive", "title": "Find the Processing Error: Scenario Cards", "status": "placeholder" },
                { "type": "reference", "title": "Processing Step Checklist with Common Faults", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "pt1-3",
          "title": "Penetrant Processing: Development Through Postcleaning",
          "cpSection": "2.0 Liquid Penetrant Processing (2.5-2.7)",
          "hours": 4.25,
          "lessons": [
            {
              "id": "pt1-3-1",
              "title": "Developer Application and Drying",
              "minutes": 60,
              "objectives": [
                "Compare dry powder, water-soluble, water-suspendible, and nonaqueous developers",
                "Apply developer correctly and control drying time and temperature"
              ],
              "topics": [
                "2.5 Developer application and drying"
              ],
              "media": [
                { "type": "video", "title": "Developer Forms and Application Techniques", "duration": "09:00", "status": "placeholder" },
                { "type": "diagram", "title": "How Developer Draws Penetrant from a Crack", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt1-3-2",
              "title": "Inspection and Evaluation",
              "minutes": 75,
              "objectives": [
                "Inspect developed parts under correct lighting and within required development times",
                "Distinguish true, false, relevant, and nonrelevant indications at a Level I scope",
                "Document observations for review by certified personnel"
              ],
              "topics": [
                "2.6 Inspection and evaluation"
              ],
              "media": [
                { "type": "video", "title": "Reading Bleed-Out: Crack, Porosity, or Noise?", "duration": "10:00", "status": "placeholder" },
                { "type": "interactive", "title": "Indication Gallery: First-Look Interpretation Practice", "status": "placeholder" },
                { "type": "reference", "title": "Development Time and Viewing Condition Limits", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt1-3-3",
              "title": "Postcleaning",
              "minutes": 45,
              "objectives": [
                "Explain why residual penetrant materials must be removed after inspection",
                "Select postcleaning methods compatible with the part and subsequent processing"
              ],
              "topics": [
                "2.7 Postcleaning"
              ],
              "media": [
                { "type": "narration", "title": "Postcleaning and Corrosion Prevention", "duration": "07:00", "status": "placeholder" },
                { "type": "reference", "title": "Postcleaning Method Compatibility Chart", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt1-3-4",
              "title": "End-to-End Processing Workshop",
              "minutes": 75,
              "objectives": [
                "Sequence and perform the complete seven-step penetrant process on practice scenarios",
                "Troubleshoot indication quality problems back to the processing step that caused them"
              ],
              "topics": [
                "2.1 Preparation of parts (applied practice)",
                "2.2 Adequate lighting (applied practice)",
                "2.3 Application of penetrant to parts (applied practice)",
                "2.4 Removal of surface penetrant (applied practice)",
                "2.5 Developer application and drying (applied practice)",
                "2.6 Inspection and evaluation (applied practice)",
                "2.7 Postcleaning (applied practice)"
              ],
              "media": [
                { "type": "simulation", "title": "Virtual Penetrant Line: Full Process Run", "status": "placeholder" },
                { "type": "video", "title": "Complete Fluorescent PT Inspection, Start to Finish", "duration": "14:00", "status": "placeholder" },
                { "type": "interactive", "title": "Troubleshooting Lab: Trace the Faulty Step", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "pt1-4",
          "title": "Penetrant Testing Methods and Standards",
          "cpSection": "3.0 Various PT Methods",
          "hours": 3.0,
          "lessons": [
            {
              "id": "pt1-4-1",
              "title": "Current ASTM and ASME Standard Methods",
              "minutes": 60,
              "objectives": [
                "Identify the governing standard practices: ASTM E165, E1208, E1209, E1210, and E1417",
                "Relate each standard to the penetrant methods and processes it controls"
              ],
              "topics": [
                "3.1 Current ASTM and ASME standard methods - ASTM E165, E1208, E1209, E1210, and E1417"
              ],
              "media": [
                { "type": "narration", "title": "The PT Standards Family Explained", "duration": "09:00", "status": "placeholder" },
                { "type": "reference", "title": "Standard-to-Method Cross-Reference Table", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt1-4-2",
              "title": "Characteristics of Each Method",
              "minutes": 60,
              "objectives": [
                "Describe the characteristics of water-washable, postemulsifiable, and solvent-removable methods",
                "Compare sensitivity, cost, and process control demands across methods"
              ],
              "topics": [
                "3.2 Characteristics of each method"
              ],
              "media": [
                { "type": "video", "title": "Method A, B, C, and D Side by Side", "duration": "10:00", "status": "placeholder" },
                { "type": "diagram", "title": "Method Characteristics Comparison Matrix", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt1-4-3",
              "title": "General Applications of Each Method",
              "minutes": 60,
              "objectives": [
                "Match each penetrant method to typical part types, surface conditions, and inspection environments",
                "Practice selecting a method for representative inspection scenarios"
              ],
              "topics": [
                "3.3 General applications of each method"
              ],
              "media": [
                { "type": "interactive", "title": "Method Selection Scenario Practice", "status": "placeholder" },
                { "type": "video", "title": "Where Each Method Earns Its Keep", "duration": "08:00", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "pt1-5",
          "title": "PT Equipment, Lighting, and Materials",
          "cpSection": "4.0 PT Equipment",
          "hours": 2.75,
          "lessons": [
            {
              "id": "pt1-5-1",
              "title": "PT Units and Processing Lines",
              "minutes": 45,
              "objectives": [
                "Identify the stations of a stationary penetrant line and the contents of portable PT kits",
                "Describe the function of each station from preclean through inspection booth"
              ],
              "topics": [
                "4.1 PT units"
              ],
              "media": [
                { "type": "video", "title": "Tour of a Fluorescent Penetrant Processing Line", "duration": "10:00", "status": "placeholder" },
                { "type": "diagram", "title": "Penetrant Line Station Layout", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt1-5-2",
              "title": "Lighting for PT Equipment and Light Meters",
              "minutes": 60,
              "objectives": [
                "Verify UV-A intensity, white light intensity, and ambient light limits with appropriate meters",
                "Apply warm-up, distance, and calibration requirements for PT light sources"
              ],
              "topics": [
                "4.2 Lighting for PT equipment and light meters"
              ],
              "media": [
                { "type": "video", "title": "Using UV-A and White Light Meters Correctly", "duration": "08:00", "status": "placeholder" },
                { "type": "interactive", "title": "Light Meter Reading Practice", "status": "placeholder" },
                { "type": "reference", "title": "Typical Lighting Acceptance Values", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt1-5-3",
              "title": "PT Materials and Precautions",
              "minutes": 60,
              "objectives": [
                "Identify penetrants, emulsifiers, removers, and developers as a qualified material family",
                "Apply safety and process precautions including material compatibility, contamination control, and temperature limits"
              ],
              "topics": [
                "4.3 Materials for PT",
                "4.4 Precautions in PT"
              ],
              "media": [
                { "type": "video", "title": "Penetrant Material Families and Compatibility", "duration": "09:00", "status": "placeholder" },
                { "type": "reference", "title": "PT Safety and Handling Precautions Summary", "status": "placeholder" }
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
      "description": "Advanced liquid penetrant testing covering method selection, indication formation and the factors that influence it, interpretation and evaluation of indications from cracks, porosity, and specific material forms, process control, and inspection procedures, documentation, and standards. Structured to the ANSI/ASNT CP-105-2024 PT Level II topical outline with additional evaluation workshops to satisfy NAS 410 hour requirements.",
      "finalExam": { "questions": 50, "passingScore": 80, "bank": "LPI", "bankLevel": 2, "status": "placeholder" },
      "modules": [
        {
          "id": "pt2-1",
          "title": "Level I Review",
          "cpSection": "1.0 Review",
          "hours": 2.5,
          "lessons": [
            {
              "id": "pt2-1-1",
              "title": "Basic Principles Review",
              "minutes": 45,
              "objectives": [
                "Restate the capillary-action principles underlying penetrant entry and bleed-out",
                "Review penetrant types, sensitivity levels, and removal classifications",
                "Explain the physics of penetrant behavior and how process variables are controlled and measured",
                "Describe how test object factors affect the penetrant process"
              ],
              "topics": [
                "1.1 Basic principles",
                "1.1.2 Effects of test object factors on process",
                "1.2 Theory",
                "1.2.1 Physics of how penetrants work",
                "1.2.2 Control and measurement of penetrant process",
                "1.2.2.1 Surface tension, viscosity, and capillary action",
                "1.2.2.2 Measurement of penetrability",
                "1.2.2.3 Contrast, brightness, and fluorescence",
                "1.2.2.4 Contamination of materials"
              ],
              "media": [
                { "type": "video", "title": "PT Level I in 12 Minutes", "duration": "12:00", "status": "placeholder" },
                { "type": "interactive", "title": "Principles Rapid Review Quiz Deck", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt2-1-2",
              "title": "Process of Various Methods Review",
              "minutes": 60,
              "objectives": [
                "Trace the processing sequence for water-washable, postemulsifiable, and solvent-removable methods",
                "Identify the critical control points in each method's process flow",
                "Classify penetrant systems as solvent-removable, water-washable, postemulsifiable (hydrophilic or lipophilic), or dual sensitivity"
              ],
              "topics": [
                "1.2 Process of various methods",
                "1.4 Liquid penetrant processing",
                "2.3.1 Solvent-removable",
                "2.3.2 Water-washable",
                "2.3.3 Postemulsifiable",
                "2.3.3.1 Water base (hydrophilic)",
                "2.3.3.2 Oil base (lipophilic)",
                "2.3.4 Dual sensitivity"
              ],
              "media": [
                { "type": "diagram", "title": "Process Flowcharts for Methods A, B, C, and D", "status": "placeholder" },
                { "type": "interactive", "title": "Sequence the Process Steps Exercise", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt2-1-3",
              "title": "Equipment Review",
              "minutes": 45,
              "objectives": [
                "Review stationary and portable PT equipment, lighting, and light meters",
                "Confirm equipment readiness requirements before processing parts",
                "Measure white light and ultraviolet radiation intensity, including warm-up time requirements",
                "Contrast the physics and physiological responses involved in visible and fluorescent viewing"
              ],
              "topics": [
                "1.3 Equipment",
                "2.1 Methods of measurement",
                "2.2.1 White light intensity",
                "2.2.2 Ultraviolet radiation intensity, warm-up time",
                "2.2.3 Physics and physiological differences"
              ],
              "media": [
                { "type": "video", "title": "Equipment Walkdown Refresher", "duration": "08:00", "status": "placeholder" },
                { "type": "reference", "title": "Equipment Readiness Checklist", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "pt2-2",
          "title": "Selection of the Appropriate PT Method",
          "cpSection": "2.0 Selection of the Appropriate Liquid Penetrant Testing Method",
          "hours": 3.0,
          "lessons": [
            {
              "id": "pt2-2-1",
              "title": "Advantages of the Various Methods",
              "minutes": 60,
              "objectives": [
                "Describe the advantages of water-washable, postemulsifiable, and solvent-removable methods",
                "Relate sensitivity level selection to inspection requirements"
              ],
              "topics": [
                "2.1 Advantages of various methods"
              ],
              "media": [
                { "type": "video", "title": "Strengths of Each Method in Practice", "duration": "09:00", "status": "placeholder" },
                { "type": "diagram", "title": "Method Advantages Summary Matrix", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt2-2-2",
              "title": "Disadvantages of the Various Methods",
              "minutes": 60,
              "objectives": [
                "Describe the limitations and risks of each penetrant method",
                "Recognize part and surface conditions that disqualify a given method"
              ],
              "topics": [
                "2.2 Disadvantages of various methods"
              ],
              "media": [
                { "type": "video", "title": "Failure Modes: When a Method Backfires", "duration": "09:00", "status": "placeholder" },
                { "type": "reference", "title": "Method Limitation and Risk Table", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt2-2-3",
              "title": "Method Selection Workshop",
              "minutes": 60,
              "objectives": [
                "Select and defend a penetrant method for representative parts, surfaces, and environments",
                "Weigh advantages against disadvantages to make documented selection decisions",
                "Justify the selection of PT over other NDT methods, recognizing complementary roles and potential conflicting results",
                "Select the appropriate PT technique for a given inspection problem"
              ],
              "topics": [
                "2.1 Advantages of various methods (applied practice)",
                "2.2 Disadvantages of various methods (applied practice)",
                "1.3 Proper selection of PT as method of choice",
                "1.3.1 Difference between PT and other methods",
                "1.3.2 Complementary roles of PT and other methods",
                "1.3.3 Potential for conflicting results between methods",
                "1.3.5 Selection of PT technique"
              ],
              "media": [
                { "type": "simulation", "title": "Method Selection Scenarios: 10 Parts to Disposition", "status": "placeholder" },
                { "type": "interactive", "title": "Advantage vs. Disadvantage Trade-Off Builder", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "pt2-3",
          "title": "Indication Formation and Influencing Factors",
          "cpSection": "3.0 Inspection and Evaluation of Indications (3.1-3.2)",
          "hours": 3.0,
          "lessons": [
            {
              "id": "pt2-3-1",
              "title": "Why Indications Form: Appearance, Timing, and Persistence",
              "minutes": 60,
              "objectives": [
                "Relate discontinuities inherent in various materials to the indications they produce",
                "Predict the appearance, time to appear, and persistence of indications from different discontinuity types"
              ],
              "topics": [
                "3.1 General",
                "3.1.1 Discontinuities inherent in various materials",
                "3.1.2 Reason for indications",
                "3.1.3 Appearance of indications",
                "3.1.4 Time for indications to appear",
                "3.1.5 Persistence of indications"
              ],
              "media": [
                { "type": "video", "title": "Watching Indications Develop in Real Time", "duration": "11:00", "status": "placeholder" },
                { "type": "interactive", "title": "Bleed-Out Behavior Predictor", "status": "placeholder" },
                { "type": "diagram", "title": "Indication Morphology by Discontinuity Type", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt2-3-2",
              "title": "Environment, Smearing, Sequence, and Part Preparation",
              "minutes": 60,
              "objectives": [
                "Explain the effects of temperature and lighting (white to ultraviolet) on indication visibility",
                "Describe how metal smearing operations such as shot peening and machining mask discontinuities",
                "State the preferred inspection sequence and part preparation requirements including stripping"
              ],
              "topics": [
                "3.1.6 Effects of temperature and lighting [white to ultraviolet (UV)]",
                "3.1.7 Effects of metal smearing operations (shot peening, machining, etc.)",
                "3.1.8 Preferred sequence for penetrant inspection",
                "3.1.9 Part preparation (precleaning, stripping, etc.)"
              ],
              "media": [
                { "type": "video", "title": "Smeared Metal: The Hidden Crack Problem and Etching", "duration": "09:00", "status": "placeholder" },
                { "type": "reference", "title": "Inspection Sequencing Relative to Manufacturing Operations", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt2-3-3",
              "title": "Factors Affecting Indications",
              "minutes": 60,
              "objectives": [
                "Analyze how precleaning quality, penetrant selection, prior processing, and technique affect indications",
                "Diagnose weak or missing indications back to their causal factor"
              ],
              "topics": [
                "3.2 Factors affecting indications",
                "3.2.1 Precleaning",
                "3.2.2 Penetrant used",
                "3.2.3 Prior processing",
                "3.2.4 Technique used"
              ],
              "media": [
                { "type": "simulation", "title": "Cause-and-Effect Lab: Degraded Indication Diagnosis", "status": "placeholder" },
                { "type": "diagram", "title": "Factor Chain from Process Input to Indication Quality", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "pt2-4",
          "title": "Interpreting and Evaluating Indications",
          "cpSection": "3.0 Inspection and Evaluation of Indications (3.3-3.6)",
          "hours": 3.75,
          "lessons": [
            {
              "id": "pt2-4-1",
              "title": "Indications from Cracks",
              "minutes": 60,
              "objectives": [
                "Differentiate cracks occurring during solidification, processing, and service",
                "Interpret crack indication patterns and relate them to their likely origin"
              ],
              "topics": [
                "3.3 Indications from cracks",
                "3.3.1 Cracks occurring during solidification",
                "3.3.2 Cracks occurring during processing",
                "3.3.3 Cracks occurring during service"
              ],
              "media": [
                { "type": "video", "title": "Crack Indication Gallery: Hot Tears to Fatigue", "duration": "10:00", "status": "placeholder" },
                { "type": "interactive", "title": "Crack Origin Classification Exercise", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt2-4-2",
              "title": "Porosity and Indications from Specific Material Forms",
              "minutes": 60,
              "objectives": [
                "Recognize porosity indications and distinguish them from crack-like indications",
                "Identify characteristic indications in forgings, castings, plate, welds, and extrusions",
                "Compare indications from discontinuities in metallic and nonmetallic materials"
              ],
              "topics": [
                "3.4 Indications from porosity",
                "3.5 Indications from specific material forms",
                "3.5.1 Forgings",
                "3.5.2 Castings",
                "3.5.3 Plate",
                "3.5.4 Welds",
                "3.5.5 Extrusions",
                "3.3.1 Metallic materials",
                "3.3.2 Nonmetallic materials"
              ],
              "media": [
                { "type": "video", "title": "Indications by Product Form: Forging Laps to Weld Porosity", "duration": "12:00", "status": "placeholder" },
                { "type": "interactive", "title": "Material Form Indication Matching Gallery", "status": "placeholder" },
                { "type": "diagram", "title": "Typical Discontinuities by Manufacturing Process", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt2-4-3",
              "title": "Evaluation of Indications: True, False, Relevant, Nonrelevant",
              "minutes": 60,
              "objectives": [
                "Apply human factors and continuity-of-inspection principles to evaluation decisions",
                "Classify indications as true, false, relevant, or nonrelevant and disposition them accordingly"
              ],
              "topics": [
                "3.6 Evaluation of indications",
                "3.6.1 Human factors",
                "3.6.2 Continuity of inspection",
                "3.6.3 True indications",
                "3.6.4 False indications",
                "3.6.5 Relevant indications",
                "3.6.6 Nonrelevant indications"
              ],
              "media": [
                { "type": "simulation", "title": "Evaluation Workshop: 20 Indications to Classify", "status": "placeholder" },
                { "type": "video", "title": "Evaluation Discipline: Avoiding Interpretation Traps", "duration": "09:00", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt2-4-4",
              "title": "Process Control of Variables and Materials",
              "minutes": 45,
              "objectives": [
                "Control the process variables that govern penetrant system performance",
                "Perform testing and maintenance of in-use penetrant materials"
              ],
              "topics": [
                "3.6.7 Process control",
                "3.6.7.1 Controlling process variables",
                "3.6.7.2 Testing and maintenance materials"
              ],
              "media": [
                { "type": "video", "title": "Daily Process Control Checks on the Penetrant Line", "duration": "09:00", "status": "placeholder" },
                { "type": "reference", "title": "Process Control Check Frequency Table", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "pt2-5",
          "title": "Inspection Procedures, Documentation, and Standards",
          "cpSection": "4.0 Inspection Procedures and Standards; 5.0 Safety and Health",
          "hours": 5.0,
          "lessons": [
            {
              "id": "pt2-5-1",
              "title": "Inspection Procedures: Minimum Requirements",
              "minutes": 60,
              "objectives": [
                "Identify the minimum required elements of a written PT inspection procedure",
                "Review a procedure for completeness and workability before use"
              ],
              "topics": [
                "4.1 Inspection procedures (minimum requirements)"
              ],
              "media": [
                { "type": "video", "title": "Anatomy of a PT Procedure", "duration": "10:00", "status": "placeholder" },
                { "type": "reference", "title": "Procedure Minimum-Content Checklist", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt2-5-2",
              "title": "Documentation of Inspection and Test",
              "minutes": 45,
              "objectives": [
                "Record inspection results completely, accurately, and traceably",
                "Prepare inspection reports suitable for review and audit"
              ],
              "topics": [
                "4.2 Documentation of inspection/test"
              ],
              "media": [
                { "type": "narration", "title": "If It Is Not Written Down, It Did Not Happen", "duration": "07:00", "status": "placeholder" },
                { "type": "reference", "title": "PT Inspection Report Template", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt2-5-3",
              "title": "Standards, Codes, and Acceptance Criteria",
              "minutes": 60,
              "objectives": [
                "Locate applicable methods and processes within governing standards and codes",
                "Apply acceptance criteria from specifications to evaluated indications"
              ],
              "topics": [
                "4.3 Standards/codes",
                "4.3.1 Applicable methods/processes",
                "4.3.2 Acceptance criteria"
              ],
              "media": [
                { "type": "video", "title": "Navigating Standards to Find Your Acceptance Criteria", "duration": "09:00", "status": "placeholder" },
                { "type": "interactive", "title": "Acceptance Criteria Application Exercise", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt2-5-4",
              "title": "Capstone Workshop: Evaluate, Disposition, and Document",
              "minutes": 60,
              "objectives": [
                "Perform a complete evaluation cycle: interpret, classify, apply acceptance criteria, and document",
                "Produce a finished inspection record meeting procedure and standard requirements"
              ],
              "topics": [
                "3.6 Evaluation of indications (applied practice)",
                "4.1 Inspection procedures (minimum requirements) (applied practice)",
                "4.2 Documentation of inspection/test (applied practice)",
                "4.3 Standards/codes (applied practice)"
              ],
              "media": [
                { "type": "simulation", "title": "Capstone: Full Inspection Disposition and Report", "status": "placeholder" },
                { "type": "reference", "title": "Capstone Grading Rubric and Model Answers", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt2-5-5",
              "title": "Writing the PT Procedure: Required Content",
              "minutes": 45,
              "objectives": [
                "Structure a written PT procedure from foreword through reporting of results",
                "Specify the product description, test conditions, and detailed application instructions in a procedure",
                "Define how test results are recorded, classified, and reported"
              ],
              "topics": [
                "4.1 Foreword (scope, reference documents)",
                "4.4 Product (description or drawing, including area to be tested)",
                "4.5 Test conditions, including preparation for testing",
                "4.6 Detailed instructions for application of the test",
                "4.7 Recording and classifying the results of the test",
                "4.8 Reporting the results"
              ],
              "media": [
                { "type": "video", "title": "Building a PT Procedure Section by Section", "duration": "10:00", "status": "placeholder" },
                { "type": "reference", "title": "Annotated Model PT Procedure", "status": "placeholder" },
                { "type": "interactive", "title": "Procedure Section Builder Exercise", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "pt2-5-6",
              "title": "Safety and Health in PT",
              "minutes": 30,
              "objectives": [
                "Identify toxicity and flammability hazards of penetrant materials",
                "Apply precautions for ultraviolet radiation exposure",
                "Use material safety data sheets (MSDS/SDS) to control workplace hazards"
              ],
              "topics": [
                "5.0 Safety and Health",
                "5.1 Toxicity",
                "5.2 Flammability",
                "5.3 Precautions for ultraviolet radiation",
                "5.4 Material safety data sheets (MSDS/SDS)"
              ],
              "media": [
                { "type": "video", "title": "PT Shop Safety: Solvents, Penetrants, and UV", "duration": "08:00", "status": "placeholder" },
                { "type": "reference", "title": "Sample SDS Walkthrough for a Penetrant Material", "status": "placeholder" }
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