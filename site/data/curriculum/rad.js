window.NDTA_DATA=window.NDTA_DATA||{};window.NDTA_DATA['curriculum-rad']={
  "id": "rad",
  "code": "RS",
  "name": "Radiation Safety",
  "cp105": "ANSI/ASNT CP-105-2024 Appendix A: Radiographic Safety Operations and Emergency Instructions Course",
  "jurisdictionNote": "Radiation safety training-hour and content requirements are established by the regulatory jurisdiction (NRC/Agreement State or other applicable authority) and must be verified against the applicable regulations; this course documents formal training only.",
  "hours": {
    "snt_tc_1a": { "l1": null, "l2": null },
    "nas410": { "l1": null, "l2": null },
    "directToL2": null
  },
  "futureTechniques": [],
  "levels": [
    {
      "level": "RS",
      "targetHours": 40,
      "description": "Radiation safety for industrial radiography per CP-105-2024 Appendix A: personnel safety and radiation protection, survey instruments, radiation-area surveys and reports, neutron radiographic work practices and explosive-device safety, biological effects of radiation, exposure devices, emergency procedures, storage and shipment of exposure devices and sources, and state and federal regulations. Subject matter applies to multiple types of penetrating radiation and should be tailored to the applicable source and delivery system.",
      "finalExam": { "questions": 50, "passingScore": 80, "bank": null, "bankLevel": null, "status": "placeholder" },
      "modules": [
        {
          "id": "rs-1",
          "title": "Personnel Safety and Radiation Protection",
          "cpSection": "Appendix A 1.0",
          "hours": 5.5,
          "lessons": [
            {
              "id": "rs-1-1",
              "title": "Hazards of Excessive Exposure",
              "minutes": 90,
              "objectives": [
                "Describe the general hazards of alpha, beta, gamma, neutron, and X-radiation",
                "Explain specific neutron hazards including relative biological effectiveness and neutron activation",
                "Rank radiation types by penetrating power and biological concern"
              ],
              "topics": [
                "1.1 Hazards of excessive exposure",
                "1.1.1 General: alpha-, beta-, gamma-, neutron, and X-radiation",
                "1.1.1.1 Alpha particles",
                "1.1.1.2 Beta particles",
                "1.1.1.3 X-radiation",
                "1.1.1.4 Gamma radiation",
                "1.1.2 Specific neutron hazards",
                "1.1.2.1 Relative biological effectiveness",
                "1.1.2.2 Neutron activation"
              ],
              "media": [
                { "type": "video", "title": "Types of Ionizing Radiation and Their Hazards", "duration": "15:00", "status": "placeholder" },
                { "type": "diagram", "title": "Penetrating Power: Alpha, Beta, Gamma, Neutron, X-ray", "status": "placeholder" },
                { "type": "narration", "title": "Neutron Activation and RBE Explained", "duration": "8:00", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-1-2",
              "title": "Controlling Radiation Dose: Time, Distance, and Shielding",
              "minutes": 75,
              "objectives": [
                "Apply time, distance, and shielding to reduce radiation dose",
                "Calculate shielding effects using half-value and tenth-value layers",
                "Describe operation of exposure shields and exposure rooms including alarms"
              ],
              "topics": [
                "1.2 Methods of controlling radiation dose",
                "1.2.1 Time",
                "1.2.2 Distance",
                "1.2.3 Shielding",
                "1.2.3.1 Half-value layers",
                "1.2.3.2 Tenth-value layers",
                "1.2.4 Exposure shields and/or exposure rooms",
                "1.2.4.1 Operation",
                "1.2.4.2 Alarms"
              ],
              "media": [
                { "type": "video", "title": "Time, Distance, Shielding: The Three Pillars", "duration": "12:00", "status": "placeholder" },
                { "type": "interactive", "title": "Inverse Square Law and HVL Calculator", "status": "placeholder" },
                { "type": "diagram", "title": "Exposure Room Layout with Interlocks and Alarms", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-1-3",
              "title": "Personnel Monitoring Devices and Dose Units",
              "minutes": 75,
              "objectives": [
                "Differentiate dose from dose rate and use the units coulomb per kilogram, gray, and sievert",
                "Describe proper wearing of pocket dosimeters (neutron, gamma, and X-ray), film badges, and TLDs",
                "Select the correct monitoring device combination for a radiographic operation"
              ],
              "topics": [
                "1.3 Personnel monitoring",
                "1.3.1 Difference between dose and dose rate",
                "1.3.1.1 Coulomb per kilogram (C/kg)",
                "1.3.1.2 Gray (Gy)",
                "1.3.1.3 Sievert (Sv)",
                "1.3.2 Wearing of monitoring badges",
                "1.3.2.1 Pocket dosimeters",
                "1.3.2.1.1 Neutron monitoring dosimeters",
                "1.3.2.1.2 Gamma and X-ray dosimeters",
                "1.3.2.2 Film badges",
                "1.3.2.3 Thermoluminescent detectors (TLDs)"
              ],
              "media": [
                { "type": "video", "title": "Your Personal Monitoring Kit: Dosimeter, Badge, TLD", "duration": "12:00", "status": "placeholder" },
                { "type": "diagram", "title": "Dose vs. Dose Rate and SI Units Map", "status": "placeholder" },
                { "type": "reference", "title": "Radiation Units Conversion Card", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-1-4",
              "title": "Dosimeter Use, Records, Exposure Limits, and ALARA",
              "minutes": 90,
              "objectives": [
                "Read a pocket dosimeter and record daily dosimeter readings correctly",
                "State the required actions for an off-scale dosimeter",
                "Apply permissible exposure limits and the ALARA concept to daily work"
              ],
              "topics": [
                "1.3.3 Reading of pocket dosimeters",
                "1.3.4 Recording of daily dosimeter readings",
                "1.3.5 \"Off-scale\" dosimeter - required activity",
                "1.3.6 Permissible exposure limits",
                "1.3.7 As low as reasonably achievable (ALARA) concept"
              ],
              "media": [
                { "type": "video", "title": "Daily Dosimetry Routine and the Off-Scale Response", "duration": "12:00", "status": "placeholder" },
                { "type": "simulation", "title": "Read and Log the Dosimeter: Daily Practice", "status": "placeholder" },
                { "type": "reference", "title": "Permissible Exposure Limits Summary", "status": "placeholder" },
                { "type": "narration", "title": "ALARA as a Working Philosophy", "duration": "8:00", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "rs-2",
          "title": "Radiation Survey Instruments and Radiation-Area Surveys",
          "cpSection": "Appendix A 2.0-3.0",
          "hours": 5.5,
          "lessons": [
            {
              "id": "rs-2-1",
              "title": "Types of Radiation Survey Instruments",
              "minutes": 90,
              "objectives": [
                "Describe the operation of Geiger-Mueller tubes, ionization chambers, and scintillation detectors",
                "Identify neutron radiation survey equipment and when it is required",
                "Select the appropriate survey instrument for a given radiation type and intensity"
              ],
              "topics": [
                "2.1 Types of radiation instruments",
                "2.1.1 Geiger-Mueller tube",
                "2.1.2 Ionization chambers",
                "2.1.3 Scintillation chambers, counters",
                "2.2 Neutron radiation survey equipment"
              ],
              "media": [
                { "type": "video", "title": "Inside the Survey Meter: GM, Ion Chamber, Scintillator", "duration": "14:00", "status": "placeholder" },
                { "type": "diagram", "title": "Detector Operating Regions and Sensitivities", "status": "placeholder" },
                { "type": "interactive", "title": "Pick the Right Instrument for the Source", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-2-2",
              "title": "Using Survey Meters: Readings, Calibration, and Battery Checks",
              "minutes": 75,
              "objectives": [
                "Read and interpret survey meter indications accurately",
                "State calibration frequency requirements and the action required when calibration has expired",
                "Explain the importance of the battery check before each use"
              ],
              "topics": [
                "2.3 Reading and interpreting meter indications",
                "2.4 Calibration frequency",
                "2.5 Calibration expiration - action to be taken",
                "2.6 Battery check - importance"
              ],
              "media": [
                { "type": "video", "title": "Survey Meter Pre-Use Checks and Reading Technique", "duration": "10:00", "status": "placeholder" },
                { "type": "simulation", "title": "Survey Meter Practice: Scales, Multipliers, and Readings", "status": "placeholder" },
                { "type": "reference", "title": "Instrument Pre-Use Checklist", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-2-3",
              "title": "Radiation-Area Surveys, Restricted Areas, and Posting",
              "minutes": 90,
              "objectives": [
                "Determine the type and quantity of radiation present in a work area",
                "Establish restricted areas with correct boundaries",
                "Apply posting and surveillance requirements for radiation areas and high radiation areas"
              ],
              "topics": [
                "3.1 Type and quantity of radiation",
                "3.2 Establishment of restricted areas",
                "3.3 Posting and surveillance of restricted areas",
                "3.3.1 Radiation areas",
                "3.3.2 High radiation areas"
              ],
              "media": [
                { "type": "video", "title": "Setting Up the Boundary: Restricted Area Surveys", "duration": "14:00", "status": "placeholder" },
                { "type": "diagram", "title": "Radiation Area vs. High Radiation Area Posting Requirements", "status": "placeholder" },
                { "type": "simulation", "title": "Establish the Boundary: Field Survey Scenario", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-2-4",
              "title": "Exposure Reduction, Regulatory Survey Requirements, and Time Limits",
              "minutes": 75,
              "objectives": [
                "Use time, distance, and shielding to reduce personnel radiation exposure during surveys and operations",
                "Apply regulatory requirements for surveys, posting, and control of radiation and high radiation areas",
                "Establish time limits for personnel working in radiation areas"
              ],
              "topics": [
                "3.4 Use of time, distance, and shielding to reduce personnel radiation exposure",
                "3.5 Applicable regulatory requirements for surveys, posting, control of radiation, and high radiation areas",
                "3.6 Establishment of time limits"
              ],
              "media": [
                { "type": "video", "title": "Working the Boundary: Exposure Reduction in Practice", "duration": "10:00", "status": "placeholder" },
                { "type": "interactive", "title": "Stay-Time Calculator: Dose Rate and Time Limits", "status": "placeholder" },
                { "type": "reference", "title": "Survey and Posting Regulatory Requirements Summary", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "rs-3",
          "title": "Radiation Survey Reports and Biological Effects of Radiation",
          "cpSection": "Appendix A 4.0, 8.0",
          "hours": 5.0,
          "lessons": [
            {
              "id": "rs-3-1",
              "title": "Radiation Survey Reports",
              "minutes": 60,
              "objectives": [
                "List the requirements for completing a radiation survey report",
                "Describe the standard survey report format and required entries"
              ],
              "topics": [
                "4.1 Requirements for completion",
                "4.2 Description of report format"
              ],
              "media": [
                { "type": "video", "title": "Documenting the Survey: Reports That Hold Up", "duration": "10:00", "status": "placeholder" },
                { "type": "interactive", "title": "Complete a Survey Report from Field Data", "status": "placeholder" },
                { "type": "reference", "title": "Survey Report Template and Field Guide", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-3-2",
              "title": "Background Radiation, Dose Units, and Radiation vs. Contamination",
              "minutes": 90,
              "objectives": [
                "Describe natural background radiation and its typical contributions to dose",
                "Use the sievert (Sv) as the unit of radiation dose",
                "Distinguish radiation exposure from radioactive contamination"
              ],
              "topics": [
                "8.1 \"Natural\" background radiation",
                "8.2 Unit of radiation dose - sievert (Sv)",
                "8.3 Difference between radiation and contamination"
              ],
              "media": [
                { "type": "video", "title": "Background Radiation and What a Sievert Means", "duration": "12:00", "status": "placeholder" },
                { "type": "diagram", "title": "Sources of Background Dose Compared to Occupational Limits", "status": "placeholder" },
                { "type": "narration", "title": "Exposed vs. Contaminated: A Critical Distinction", "duration": "8:00", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-3-3",
              "title": "Radiation Damage, Injury Symptoms, and Acute Exposure",
              "minutes": 90,
              "objectives": [
                "Explain the radiation damage and repair concept in living tissue",
                "Recognize symptoms of radiation injury",
                "Describe acute radiation exposure and somatic injury"
              ],
              "topics": [
                "8.4 Radiation damage - repair concept",
                "8.5 Symptoms of radiation injury",
                "8.6 Acute radiation exposure and somatic injury"
              ],
              "media": [
                { "type": "video", "title": "How Radiation Affects Living Tissue", "duration": "14:00", "status": "placeholder" },
                { "type": "diagram", "title": "Acute Exposure Dose Ranges and Effects", "status": "placeholder" },
                { "type": "reference", "title": "Radiation Injury Symptoms Reference Table", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-3-4",
              "title": "Exposure Tracking and Organ Radiosensitivity",
              "minutes": 60,
              "objectives": [
                "Explain how personnel monitoring tracks cumulative occupational exposure",
                "Compare the relative radiosensitivity of body organs and tissues"
              ],
              "topics": [
                "8.7 Personnel monitoring for tracking exposure",
                "8.8 Organ radiosensitivity"
              ],
              "media": [
                { "type": "video", "title": "Tracking Dose Over a Career", "duration": "10:00", "status": "placeholder" },
                { "type": "diagram", "title": "Organ and Tissue Radiosensitivity Ranking", "status": "placeholder" },
                { "type": "interactive", "title": "Cumulative Dose Tracker Exercise", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "rs-4",
          "title": "Neutron Radiographic Work Practices and Explosive-Device Safety",
          "cpSection": "Appendix A 5.0-6.0",
          "hours": 4.5,
          "lessons": [
            {
              "id": "rs-4-1",
              "title": "Radioactive Contamination Control for NR Work",
              "minutes": 75,
              "objectives": [
                "State clothing requirements for working where radioactive contamination is possible",
                "Apply contamination control practices",
                "Describe contamination cleanup procedures"
              ],
              "topics": [
                "5.0 Neutron radiographic (NR) work practices",
                "5.1 Radioactive contamination",
                "5.1.1 Clothing requirements",
                "5.1.2 Contamination control",
                "5.1.3 Contamination cleanup"
              ],
              "media": [
                { "type": "video", "title": "Contamination Control: Dress, Contain, Clean", "duration": "12:00", "status": "placeholder" },
                { "type": "diagram", "title": "Contamination Control Zones and PPE Levels", "status": "placeholder" },
                { "type": "reference", "title": "Contamination Cleanup Procedure Outline", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-4-2",
              "title": "NR Operating and Emergency Procedures",
              "minutes": 60,
              "objectives": [
                "Describe operation and emergency procedures applicable to neutron radiography",
                "Identify the specific procedures required for NR facilities and operations"
              ],
              "topics": [
                "5.2 Operation and emergency procedures",
                "5.3 Specific procedures"
              ],
              "media": [
                { "type": "video", "title": "NR Operations: Procedures That Keep You Safe", "duration": "10:00", "status": "placeholder" },
                { "type": "reference", "title": "Generic NR Operating and Emergency Procedure Set", "status": "placeholder" },
                { "type": "interactive", "title": "Procedure Sequencing Exercise", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-4-3",
              "title": "Explosive-Device Safety: Static Electricity, Grounding, and Clothing",
              "minutes": 60,
              "objectives": [
                "Explain the static electricity hazard when radiographing explosive devices",
                "Describe grounding devices and their proper use",
                "State clothing requirements for explosive-device work"
              ],
              "topics": [
                "6.0 NR explosive-device safety",
                "6.1 Static electricity",
                "6.2 Grounding devices",
                "6.3 Clothing requirements"
              ],
              "media": [
                { "type": "video", "title": "Static and Explosives: Controlling Ignition Sources", "duration": "10:00", "status": "placeholder" },
                { "type": "diagram", "title": "Grounding and Bonding Arrangement for Explosive-Device Radiography", "status": "placeholder" },
                { "type": "reference", "title": "Explosive-Area Clothing and PPE Requirements", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-4-4",
              "title": "Explosive Devices: Handling, Storage, Shipping, and Licensing",
              "minutes": 75,
              "objectives": [
                "Describe handling and storage requirements and procedures for explosive devices",
                "Summarize shipping and receiving procedures",
                "Identify state and federal explosive-licensing requirements"
              ],
              "topics": [
                "6.4 Handling and storage requirements and procedures",
                "6.5 Shipping and receiving procedures",
                "6.6 State and federal explosive-licensing requirements"
              ],
              "media": [
                { "type": "video", "title": "Moving and Storing Explosive Devices Safely", "duration": "12:00", "status": "placeholder" },
                { "type": "reference", "title": "Explosive Licensing Requirements Overview", "status": "placeholder" },
                { "type": "interactive", "title": "Shipping and Receiving Procedure Checkpoints", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "rs-5",
          "title": "Safety and Health, and Exposure Devices",
          "cpSection": "Appendix A 7.0, 9.0",
          "hours": 4.5,
          "lessons": [
            {
              "id": "rs-5-1",
              "title": "Radiation Hazards and Exposure Control in Daily Operations",
              "minutes": 75,
              "objectives": [
                "Summarize exposure hazards encountered in radiographic operations",
                "Apply methods of controlling radiation exposure in routine work",
                "Relate operation and emergency procedures to overall safety and health"
              ],
              "topics": [
                "7.0 Safety and health",
                "7.1 Radiation hazards",
                "7.1.1 Exposure hazards",
                "7.1.2 Methods of controlling radiation exposure",
                "7.1.3 Operation and emergency procedures"
              ],
              "media": [
                { "type": "video", "title": "A Radiographer's Day: Hazards and Controls", "duration": "12:00", "status": "placeholder" },
                { "type": "diagram", "title": "Hierarchy of Exposure Controls in Radiography", "status": "placeholder" },
                { "type": "narration", "title": "Why Procedures Exist: Lessons from Incidents", "duration": "8:00", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-5-2",
              "title": "Exposure Devices: Daily Inspection, Maintenance, and Exposure Limits",
              "minutes": 75,
              "objectives": [
                "Perform daily inspection and maintenance checks on exposure devices",
                "State radiation exposure limits for gamma ray exposure devices",
                "Recognize device defects that require removal from service"
              ],
              "topics": [
                "9.0 Exposure devices",
                "9.1 Daily inspection and maintenance",
                "9.2 Radiation exposure limits for gamma ray exposure devices"
              ],
              "media": [
                { "type": "video", "title": "Daily Camera Checks: What to Inspect and Why", "duration": "12:00", "status": "placeholder" },
                { "type": "simulation", "title": "Pre-Use Device Inspection Walkthrough", "status": "placeholder" },
                { "type": "reference", "title": "Exposure Device Daily Inspection Checklist", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-5-3",
              "title": "Exposure Device Labeling and Use",
              "minutes": 60,
              "objectives": [
                "Identify required labeling on exposure devices",
                "Describe proper use of exposure devices during radiographic operations"
              ],
              "topics": [
                "9.3 Labeling",
                "9.4 Use"
              ],
              "media": [
                { "type": "video", "title": "Labels, Placards, and Proper Device Operation", "duration": "10:00", "status": "placeholder" },
                { "type": "diagram", "title": "Exposure Device Anatomy and Required Markings", "status": "placeholder" },
                { "type": "interactive", "title": "Spot the Labeling Violation", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-5-4",
              "title": "Collimators and Source Changers",
              "minutes": 60,
              "objectives": [
                "Explain how collimators reduce personnel exposure during exposures",
                "Describe the use of source changers for gamma ray sources"
              ],
              "topics": [
                "9.5 Use of collimators to reduce personnel exposure",
                "9.6 Use of source changers for gamma ray sources"
              ],
              "media": [
                { "type": "video", "title": "Collimation and Source Exchange Operations", "duration": "12:00", "status": "placeholder" },
                { "type": "diagram", "title": "Dose Rate Map With and Without a Collimator", "status": "placeholder" },
                { "type": "simulation", "title": "Source Changer Operation Sequence", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "rs-6",
          "title": "Emergency Procedures",
          "cpSection": "Appendix A 10.0",
          "hours": 4.5,
          "lessons": [
            {
              "id": "rs-6-1",
              "title": "Vehicle Accidents Involving Radioactive Sealed Sources",
              "minutes": 60,
              "objectives": [
                "Describe immediate actions following a vehicle accident with radioactive sealed sources aboard",
                "Establish control of the scene and protect the public pending assistance"
              ],
              "topics": [
                "10.0 Emergency procedures",
                "10.1 Vehicle accidents with radioactive sealed sources"
              ],
              "media": [
                { "type": "video", "title": "Accident Response: Securing Sources at the Scene", "duration": "12:00", "status": "placeholder" },
                { "type": "interactive", "title": "Accident Scene Decision Drill", "status": "placeholder" },
                { "type": "reference", "title": "Vehicle Accident Response Steps Card", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-6-2",
              "title": "Fire Involving Sealed Sources",
              "minutes": 60,
              "objectives": [
                "Describe the response to a fire involving sealed sources",
                "Identify information that must be communicated to emergency responders"
              ],
              "topics": [
                "10.2 Fire involving sealed sources"
              ],
              "media": [
                { "type": "video", "title": "Fire and Sealed Sources: Response Priorities", "duration": "10:00", "status": "placeholder" },
                { "type": "diagram", "title": "Fire Emergency Communication Flow", "status": "placeholder" },
                { "type": "interactive", "title": "Fire Scenario: Choose the Correct Actions", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-6-3",
              "title": "Source-Out Emergencies: Failure to Return to Shielded Condition",
              "minutes": 90,
              "objectives": [
                "Recognize a source-out condition where the source fails to return to its safe shielded position",
                "Execute the correct immediate response: secure the area, survey, and notify",
                "Explain why source retrieval is reserved for specifically trained and authorized personnel"
              ],
              "topics": [
                "10.3 \"Source out\" - failure to return to safe shielded conditions"
              ],
              "media": [
                { "type": "video", "title": "The Stuck Source: Recognizing and Responding", "duration": "15:00", "status": "placeholder" },
                { "type": "simulation", "title": "Source-Out Drill: Survey, Secure, Notify", "status": "placeholder" },
                { "type": "diagram", "title": "Source-Out Response Decision Tree", "status": "placeholder" },
                { "type": "narration", "title": "Case Review: Source-Out Incidents and Lessons Learned", "duration": "10:00", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-6-4",
              "title": "The Emergency Call List and Notification Duties",
              "minutes": 60,
              "objectives": [
                "Use the emergency call list to make required notifications in the correct order",
                "Identify the information each contact on the list requires"
              ],
              "topics": [
                "10.4 Emergency call list"
              ],
              "media": [
                { "type": "video", "title": "Who You Call and What You Say", "duration": "10:00", "status": "placeholder" },
                { "type": "interactive", "title": "Build and Use an Emergency Call List", "status": "placeholder" },
                { "type": "reference", "title": "Emergency Notification Template", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "rs-7",
          "title": "Storage and Shipment of Exposure Devices and Sources",
          "cpSection": "Appendix A 11.0",
          "hours": 4.5,
          "lessons": [
            {
              "id": "rs-7-1",
              "title": "Vehicle Storage and Permanent Storage Vaults",
              "minutes": 90,
              "objectives": [
                "Describe requirements for vehicle storage of exposure devices and sources",
                "Describe requirements for permanent storage vaults including security and posting"
              ],
              "topics": [
                "11.0 Storage and shipment of exposure devices and sources",
                "11.1 Vehicle storage",
                "11.2 Storage vault - permanent"
              ],
              "media": [
                { "type": "video", "title": "Securing Sources: Truck to Vault", "duration": "12:00", "status": "placeholder" },
                { "type": "diagram", "title": "Compliant Vehicle Storage and Vault Configurations", "status": "placeholder" },
                { "type": "interactive", "title": "Storage Compliance Inspection Exercise", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-7-2",
              "title": "Shipping Instructions for Sources",
              "minutes": 90,
              "objectives": [
                "Describe packaging, labeling, and documentation requirements for shipping radioactive sources",
                "Identify the shipping papers and placarding required for transport"
              ],
              "topics": [
                "11.3 Shipping instructions - sources"
              ],
              "media": [
                { "type": "video", "title": "Preparing a Source Shipment", "duration": "12:00", "status": "placeholder" },
                { "type": "diagram", "title": "Package Labels and Transport Index Explained", "status": "placeholder" },
                { "type": "reference", "title": "Source Shipping Documentation Checklist", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-7-3",
              "title": "Receiving Radioactive Material",
              "minutes": 90,
              "objectives": [
                "Describe receiving instructions for radioactive material shipments",
                "Perform receipt surveys and inspections and document the results"
              ],
              "topics": [
                "11.4 Receiving instructions - radioactive material"
              ],
              "media": [
                { "type": "video", "title": "Receiving a Radioactive Package: Survey and Verify", "duration": "12:00", "status": "placeholder" },
                { "type": "simulation", "title": "Package Receipt Survey Walkthrough", "status": "placeholder" },
                { "type": "reference", "title": "Radioactive Material Receipt Checklist", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "rs-8",
          "title": "State and Federal Regulations",
          "cpSection": "Appendix A 12.0",
          "hours": 6.0,
          "lessons": [
            {
              "id": "rs-8-1",
              "title": "NRC, Agreement States, and License Reciprocity",
              "minutes": 90,
              "objectives": [
                "Explain the authority of the NRC and Agreement States over industrial radiography",
                "Describe license reciprocity when working across jurisdictions"
              ],
              "topics": [
                "12.0 State and federal regulations",
                "12.1 NRC and Agreement States - authority",
                "12.2 License reciprocity"
              ],
              "media": [
                { "type": "video", "title": "Who Regulates Radiography: NRC and Agreement States", "duration": "14:00", "status": "placeholder" },
                { "type": "diagram", "title": "Regulatory Jurisdiction Map: NRC vs. Agreement States", "status": "placeholder" },
                { "type": "reference", "title": "Reciprocity Filing Basics", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-8-2",
              "title": "Radioactive Materials Licensing and OSHA",
              "minutes": 90,
              "objectives": [
                "Summarize radioactive materials license requirements for industrial radiography",
                "Describe the role of the Occupational Safety and Health Administration (OSHA) in radiation worker protection"
              ],
              "topics": [
                "12.3 Radioactive materials license requirements for industrial radiography",
                "12.4 Occupational Safety and Health Administration (OSHA)"
              ],
              "media": [
                { "type": "video", "title": "Inside a Radiography License", "duration": "12:00", "status": "placeholder" },
                { "type": "reference", "title": "License Conditions and OSHA Touchpoints Summary", "status": "placeholder" },
                { "type": "interactive", "title": "License Requirement Sorting Exercise", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-8-3",
              "title": "Personnel Qualification and Radiation Control Regulations",
              "minutes": 90,
              "objectives": [
                "State qualification requirements for radiography personnel",
                "Apply the regulations for the control of radiation (state or NRC as applicable) to radiographic operations"
              ],
              "topics": [
                "12.5 Qualification requirements for radiography personnel",
                "12.6 Regulations for the control of radiation (state or NRC as applicable)"
              ],
              "media": [
                { "type": "video", "title": "Becoming a Qualified Radiographer: Regulatory Requirements", "duration": "12:00", "status": "placeholder" },
                { "type": "diagram", "title": "Radiographer Qualification Pathway", "status": "placeholder" },
                { "type": "reference", "title": "Radiation Control Regulation Cross-Reference", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "rs-8-4",
              "title": "DOT Transport Regulations and X-ray Machine Requirements",
              "minutes": 90,
              "objectives": [
                "Summarize Department of Transportation regulations for radiographic source shipment",
                "Describe regulatory requirements for X-ray machines (state and federal as applicable)"
              ],
              "topics": [
                "12.7 Department of Transportation regulations for radiographic source shipment",
                "12.8 Regulatory requirements for X-ray machines (state and federal as applicable)"
              ],
              "media": [
                { "type": "video", "title": "DOT Rules for Moving Sources and Registering X-ray Machines", "duration": "12:00", "status": "placeholder" },
                { "type": "diagram", "title": "Transport Package Categories and Placarding", "status": "placeholder" },
                { "type": "interactive", "title": "Shipment Compliance Scenario Check", "status": "placeholder" }
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