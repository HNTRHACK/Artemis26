import type { Application, Job, WorkerProfile } from "./types";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function isoDate(ms: number) {
  const d = new Date(ms);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * Seed jobs are built relative to "now" on the client, so "posted 3 hours ago"
 * stays believable whenever the demo is opened.
 */
export function buildSeedJobs(now: number): Job[] {
  const j = (job: Omit<Job, "postedAt" | "startDate" | "status"> & { ageH: number; startIn: number }): Job => {
    const { ageH, startIn, ...rest } = job;
    return { ...rest, postedAt: now - ageH * HOUR, startDate: isoDate(now + startIn * DAY), status: "open" };
  };

  return [
    j({
      id: "job-001",
      trade: "mason",
      title: { en: "Brickwork mason – residential tower", hi: "ईंट जोड़ाई राजमिस्त्री – आवासीय टावर", mr: "वीटकाम गवंडी – निवासी टॉवर" },
      description: {
        en: "Block and brick masonry for floors 9–14 of a G+22 residential tower. Experience with AAC blocks preferred. Site supervisor speaks Hindi and Marathi.",
        hi: "G+22 आवासीय टावर की 9–14 मंज़िलों पर ब्लॉक और ईंट की जोड़ाई। AAC ब्लॉक का अनुभव हो तो बेहतर। साइट सुपरवाइज़र हिंदी और मराठी बोलते हैं।",
        mr: "G+22 निवासी टॉवरच्या 9–14 मजल्यांवर ब्लॉक व वीटकाम. AAC ब्लॉकचा अनुभव असल्यास प्राधान्य. साइट सुपरवायझर हिंदी व मराठी बोलतात.",
      },
      employerName: "Shree Ganesh Constructions",
      owner: "local",
      area: "goregaon",
      address: { en: "Near Oberoi Mall, Goregaon East", hi: "ओबेरॉय मॉल के पास, गोरेगाव पूर्व", mr: "ओबेरॉय मॉलजवळ, गोरेगाव पूर्व" },
      wage: 950, wageUnit: "day", duration: "threeMonths", paymentTerm: "weekly", paymentMode: "upi",
      workersNeeded: 8, experienceMin: 2, hours: "08:30 – 17:30",
      benefits: ["safetyGear", "meals", "overtime"], ageH: 3, startIn: 2,
    }),
    j({
      id: "job-002",
      trade: "electrician",
      title: { en: "Wiring electrician – office fit-out", hi: "वायरिंग इलेक्ट्रीशियन – ऑफ़िस फ़िट-आउट", mr: "वायरिंग इलेक्ट्रिशियन – ऑफिस फिट-आउट" },
      description: {
        en: "Concealed conduit wiring, DB installation and lighting points for a 12,000 sq ft office. Must read basic electrical drawings.",
        hi: "12,000 वर्ग फुट ऑफ़िस में कंसील्ड कंड्यूट वायरिंग, DB लगाना और लाइटिंग पॉइंट। बेसिक इलेक्ट्रिकल ड्रॉइंग पढ़ना आना चाहिए।",
        mr: "12,000 चौ. फूट ऑफिसमध्ये कन्सील्ड कंड्युट वायरिंग, DB बसवणे आणि लाइटिंग पॉइंट्स. मूलभूत इलेक्ट्रिकल ड्रॉइंग वाचता यायला हवे.",
      },
      employerName: "Kapoor Interiors LLP",
      owner: "seed",
      area: "lowerParel",
      address: { en: "Kamala Mills compound, Lower Parel", hi: "कमला मिल्स कंपाउंड, लोअर परेल", mr: "कमला मिल्स कंपाउंड, लोअर परळ" },
      wage: 1200, wageUnit: "day", duration: "month", paymentTerm: "weekly", paymentMode: "bank",
      workersNeeded: 4, experienceMin: 3, hours: "09:00 – 18:00",
      benefits: ["safetyGear", "overtime"], ageH: 6, startIn: 1,
    }),
    j({
      id: "job-003",
      trade: "helper",
      title: { en: "Site helper – material shifting", hi: "साइट हेल्पर – सामान ढुलाई", mr: "साइट हेल्पर – साहित्य वाहतूक" },
      description: {
        en: "Loading, unloading and shifting cement bags, sand and steel at a redevelopment site. No experience needed. Daily cash at end of shift.",
        hi: "रीडेवलपमेंट साइट पर सीमेंट की बोरियाँ, रेत और स्टील चढ़ाना-उतारना। अनुभव ज़रूरी नहीं। शिफ़्ट ख़त्म होने पर रोज़ नकद भुगतान।",
        mr: "पुनर्विकास साइटवर सिमेंटच्या गोण्या, वाळू आणि स्टील चढवणे-उतरवणे. अनुभव आवश्यक नाही. शिफ्ट संपल्यावर रोज रोख पैसे.",
      },
      employerName: "Patil Developers",
      owner: "seed",
      area: "dadar",
      address: { en: "Gokhale Road, Dadar West", hi: "गोखले रोड, दादर पश्चिम", mr: "गोखले रोड, दादर पश्चिम" },
      wage: 700, wageUnit: "day", duration: "week", paymentTerm: "daily", paymentMode: "cash",
      workersNeeded: 12, experienceMin: 0, hours: "08:00 – 17:00",
      benefits: ["meals", "safetyGear"], ageH: 1, startIn: 0,
    }),
    j({
      id: "job-004",
      trade: "plumber",
      title: { en: "Plumber – bathroom renovation", hi: "प्लंबर – बाथरूम रेनोवेशन", mr: "प्लंबर – बाथरूम नूतनीकरण" },
      description: {
        en: "Replace CPVC lines, fix concealed mixers and WC in two flats. Bring your own basic tools; heavy tools provided.",
        hi: "दो फ़्लैट में CPVC लाइन बदलना, कंसील्ड मिक्सर और WC लगाना। अपने बेसिक औज़ार लाएँ; भारी औज़ार दिए जाएँगे।",
        mr: "दोन फ्लॅटमध्ये CPVC लाईन बदलणे, कन्सील्ड मिक्सर व WC बसवणे. स्वतःची मूलभूत हत्यारे आणा; जड हत्यारे दिली जातील.",
      },
      employerName: "Mehta Home Services",
      owner: "seed",
      area: "bandra",
      address: { en: "Pali Hill, Bandra West", hi: "पाली हिल, बांद्रा पश्चिम", mr: "पाली हिल, वांद्रे पश्चिम" },
      wage: 6500, wageUnit: "task", duration: "week", paymentTerm: "onCompletion", paymentMode: "upi",
      workersNeeded: 1, experienceMin: 3, hours: "10:00 – 18:00",
      benefits: ["transport"], ageH: 20, startIn: 3,
    }),
    j({
      id: "job-005",
      trade: "painter",
      title: { en: "Exterior painter – society repainting", hi: "बाहरी पेंटर – सोसायटी रंगाई", mr: "बाह्य रंगारी – सोसायटी रंगकाम" },
      description: {
        en: "Repainting the exterior of a 7-storey housing society using rope access cradles. Training on harness given on day one.",
        hi: "7 मंज़िला हाउसिंग सोसायटी की बाहरी दीवारों की रंगाई, क्रेडल से। पहले दिन हार्नेस की ट्रेनिंग दी जाएगी।",
        mr: "7 मजली गृहनिर्माण सोसायटीच्या बाह्य भिंतींचे रंगकाम, क्रेडलवरून. पहिल्या दिवशी हार्नेसचे प्रशिक्षण दिले जाईल.",
      },
      employerName: "Rangoli Paints Contractors",
      owner: "local",
      area: "chembur",
      address: { en: "Diamond Garden, Chembur", hi: "डायमंड गार्डन, चेंबूर", mr: "डायमंड गार्डन, चेंबूर" },
      wage: 850, wageUnit: "day", duration: "month", paymentTerm: "weekly", paymentMode: "cash",
      workersNeeded: 6, experienceMin: 1, hours: "08:00 – 16:30",
      benefits: ["safetyGear", "meals"], ageH: 28, startIn: 4,
    }),
    j({
      id: "job-006",
      trade: "carpenter",
      title: { en: "Carpenter – modular kitchen & wardrobes", hi: "बढ़ई – मॉड्यूलर किचन और अलमारी", mr: "सुतार – मॉड्युलर किचन व कपाटे" },
      description: {
        en: "Installing factory-made modular kitchens and sliding wardrobes across three apartments. Laminate edge-finishing skill required.",
        hi: "तीन अपार्टमेंट में फ़ैक्टरी में बने मॉड्यूलर किचन और स्लाइडिंग अलमारी लगाना। लैमिनेट एज-फ़िनिशिंग आनी चाहिए।",
        mr: "तीन अपार्टमेंटमध्ये फॅक्टरीत बनलेली मॉड्युलर किचन व स्लायडिंग कपाटे बसवणे. लॅमिनेट एज-फिनिशिंग यायला हवे.",
      },
      employerName: "WoodCraft Studio",
      owner: "seed",
      area: "powai",
      address: { en: "Hiranandani Gardens, Powai", hi: "हीरानंदानी गार्डन्स, पवई", mr: "हिरानंदानी गार्डन्स, पवई" },
      wage: 1100, wageUnit: "day", duration: "month", paymentTerm: "weekly", paymentMode: "bank",
      workersNeeded: 3, experienceMin: 4, hours: "09:30 – 18:30",
      benefits: ["transport", "overtime"], ageH: 9, startIn: 5,
    }),
    j({
      id: "job-007",
      trade: "housekeeping",
      title: { en: "Housekeeping staff – hospital", hi: "हाउसकीपिंग स्टाफ़ – अस्पताल", mr: "हाउसकीपिंग कर्मचारी – रुग्णालय" },
      description: {
        en: "Ward and corridor cleaning in rotating shifts at a private hospital. Uniform provided. Monthly salary with PF and ESIC as per company policy.",
        hi: "निजी अस्पताल में घूमती शिफ़्ट में वार्ड और गलियारे की सफ़ाई। वर्दी दी जाएगी। कंपनी नीति के अनुसार PF और ESIC के साथ मासिक वेतन।",
        mr: "खाजगी रुग्णालयात फिरत्या शिफ्टमध्ये वॉर्ड व कॉरिडॉर स्वच्छता. गणवेश दिला जाईल. कंपनी धोरणानुसार PF व ESIC सह मासिक पगार.",
      },
      employerName: "CleanCare Facility Services",
      owner: "seed",
      area: "andheri",
      address: { en: "Marol, Andheri East", hi: "मरोल, अंधेरी पूर्व", mr: "मरोळ, अंधेरी पूर्व" },
      wage: 17500, wageUnit: "month", duration: "ongoing", paymentTerm: "monthly", paymentMode: "bank",
      workersNeeded: 10, experienceMin: 0, hours: "07:00 – 15:00 / 15:00 – 23:00",
      benefits: ["meals"], ageH: 30, startIn: 7,
    }),
    j({
      id: "job-008",
      trade: "driver",
      title: { en: "Tempo driver – building material delivery", hi: "टेम्पो ड्राइवर – निर्माण सामग्री डिलीवरी", mr: "टेम्पो चालक – बांधकाम साहित्य डिलिव्हरी" },
      description: {
        en: "Drive a 407 tempo for deliveries between Thane depot and city sites. Valid LMV/transport licence required.",
        hi: "ठाणे डिपो से शहर की साइटों तक 407 टेम्पो चलाना। वैध LMV/ट्रांसपोर्ट लाइसेंस ज़रूरी।",
        mr: "ठाणे डेपोपासून शहरातील साइट्सपर्यंत 407 टेम्पो चालवणे. वैध LMV/ट्रान्सपोर्ट परवाना आवश्यक.",
      },
      employerName: "Sai Logistics",
      owner: "seed",
      area: "thane",
      address: { en: "Wagle Estate, Thane West", hi: "वागले इस्टेट, ठाणे पश्चिम", mr: "वागळे इस्टेट, ठाणे पश्चिम" },
      wage: 22000, wageUnit: "month", duration: "ongoing", paymentTerm: "monthly", paymentMode: "bank",
      workersNeeded: 2, experienceMin: 2, hours: "08:00 – 20:00",
      benefits: ["meals", "overtime"], ageH: 50, startIn: 6,
    }),
    j({
      id: "job-009",
      trade: "tiler",
      title: { en: "Tile fitter – vitrified flooring", hi: "टाइल फ़िटर – विट्रिफ़ाइड फ़्लोरिंग", mr: "टाइल फिटर – व्हिट्रिफाइड फ्लोअरिंग" },
      description: {
        en: "Laying 800×1600 vitrified tiles in 2BHK flats. Must be comfortable with levelling systems and tile cutters.",
        hi: "2BHK फ़्लैट में 800×1600 विट्रिफ़ाइड टाइल लगाना। लेवलिंग सिस्टम और टाइल कटर चलाना आना चाहिए।",
        mr: "2BHK फ्लॅटमध्ये 800×1600 व्हिट्रिफाइड टाइल्स बसवणे. लेव्हलिंग सिस्टम व टाइल कटर वापरता यायला हवे.",
      },
      employerName: "Shree Ganesh Constructions",
      owner: "local",
      area: "malad",
      address: { en: "Evershine Nagar, Malad West", hi: "एवरशाइन नगर, मालाड पश्चिम", mr: "एव्हरशाइन नगर, मालाड पश्चिम" },
      wage: 1050, wageUnit: "day", duration: "month", paymentTerm: "weekly", paymentMode: "upi",
      workersNeeded: 4, experienceMin: 3, hours: "09:00 – 18:00",
      benefits: ["safetyGear"], ageH: 14, startIn: 3,
    }),
    j({
      id: "job-010",
      trade: "welder",
      title: { en: "Fabrication welder – MS grills & gates", hi: "फ़ैब्रिकेशन वेल्डर – MS ग्रिल और गेट", mr: "फॅब्रिकेशन वेल्डर – MS ग्रिल व गेट" },
      description: {
        en: "Arc welding for mild steel window grills, gates and staircase railings at a workshop. Fabrication drawings explained by supervisor.",
        hi: "वर्कशॉप में माइल्ड स्टील की खिड़की ग्रिल, गेट और सीढ़ी रेलिंग की आर्क वेल्डिंग। सुपरवाइज़र ड्रॉइंग समझाएँगे।",
        mr: "वर्कशॉपमध्ये माइल्ड स्टीलच्या खिडकी ग्रिल, गेट व जिन्याच्या रेलिंगचे आर्क वेल्डिंग. सुपरवायझर ड्रॉइंग समजावतील.",
      },
      employerName: "Bhosale Steel Works",
      owner: "seed",
      area: "kurla",
      address: { en: "Safed Pool, Sakinaka", hi: "सफ़ेद पूल, साकीनाका", mr: "सफेद पूल, साकीनाका" },
      wage: 1000, wageUnit: "day", duration: "threeMonths", paymentTerm: "weekly", paymentMode: "cash",
      workersNeeded: 2, experienceMin: 2, hours: "09:00 – 19:00",
      benefits: ["safetyGear", "overtime"], ageH: 40, startIn: 2,
    }),
    j({
      id: "job-011",
      trade: "cook",
      title: { en: "Canteen cook – construction labour camp", hi: "कैंटीन रसोइया – निर्माण मज़दूर कैंप", mr: "कॅन्टीन स्वयंपाकी – बांधकाम कामगार शिबिर" },
      description: {
        en: "Prepare breakfast and lunch for about 80 workers at an on-site labour camp. Accommodation available on site.",
        hi: "साइट पर बने मज़दूर कैंप में लगभग 80 लोगों का नाश्ता और दोपहर का खाना बनाना। साइट पर रहने की सुविधा।",
        mr: "साइटवरील कामगार शिबिरात सुमारे 80 जणांसाठी नाश्ता व दुपारचे जेवण बनवणे. साइटवर राहण्याची सोय.",
      },
      employerName: "Navkar Infra Projects",
      owner: "seed",
      area: "panvel",
      address: { en: "Near Karanjade, Panvel", hi: "करंजाडे के पास, पनवेल", mr: "करंजाडेजवळ, पनवेल" },
      wage: 16000, wageUnit: "month", duration: "ongoing", paymentTerm: "monthly", paymentMode: "bank",
      workersNeeded: 1, experienceMin: 1, hours: "05:30 – 14:00",
      benefits: ["accommodation", "meals"], ageH: 70, startIn: 10,
    }),
    j({
      id: "job-012",
      trade: "security",
      title: { en: "Security guard – night shift, warehouse", hi: "सिक्योरिटी गार्ड – रात की शिफ़्ट, गोदाम", mr: "सुरक्षा रक्षक – रात्रपाळी, गोदाम" },
      description: {
        en: "Gate and patrol duty at a logistics warehouse. Register entries, check vehicles. Weekly off on rotation.",
        hi: "लॉजिस्टिक्स गोदाम पर गेट और गश्त ड्यूटी। एंट्री रजिस्टर, वाहनों की जाँच। बारी-बारी से साप्ताहिक छुट्टी।",
        mr: "लॉजिस्टिक्स गोदामावर गेट व गस्त ड्युटी. नोंदवही, वाहनांची तपासणी. आळीपाळीने साप्ताहिक सुट्टी.",
      },
      employerName: "Shield Guard Services",
      owner: "seed",
      area: "vashi",
      address: { en: "Turbhe MIDC, Navi Mumbai", hi: "तुर्भे MIDC, नवी मुंबई", mr: "तुर्भे MIDC, नवी मुंबई" },
      wage: 18000, wageUnit: "month", duration: "ongoing", paymentTerm: "monthly", paymentMode: "bank",
      workersNeeded: 3, experienceMin: 0, hours: "20:00 – 08:00",
      benefits: ["transport"], ageH: 18, startIn: 5,
    }),
    j({
      id: "job-013",
      trade: "mason",
      title: { en: "Plaster mason – slum redevelopment", hi: "प्लास्टर राजमिस्त्री – स्लम रीडेवलपमेंट", mr: "प्लास्टर गवंडी – झोपडपट्टी पुनर्विकास" },
      description: {
        en: "Internal and external plaster work on an SRA rehabilitation building. Gypsum experience is a plus.",
        hi: "SRA पुनर्वास इमारत में अंदर-बाहर प्लास्टर का काम। जिप्सम का अनुभव हो तो अच्छा।",
        mr: "SRA पुनर्वसन इमारतीत आतील-बाहेरील प्लास्टरचे काम. जिप्समचा अनुभव असल्यास उत्तम.",
      },
      employerName: "Om Sai Builders",
      owner: "seed",
      area: "ghatkopar",
      address: { en: "Pant Nagar, Ghatkopar East", hi: "पंत नगर, घाटकोपर पूर्व", mr: "पंत नगर, घाटकोपर पूर्व" },
      wage: 900, wageUnit: "day", duration: "threeMonths", paymentTerm: "weekly", paymentMode: "cash",
      workersNeeded: 6, experienceMin: 2, hours: "08:30 – 17:30",
      benefits: ["safetyGear", "meals"], ageH: 5, startIn: 1,
    }),
    j({
      id: "job-014",
      trade: "helper",
      title: { en: "Shuttering helper – metro station work", hi: "शटरिंग हेल्पर – मेट्रो स्टेशन काम", mr: "शटरिंग हेल्पर – मेट्रो स्टेशन काम" },
      description: {
        en: "Assist carpenters with shuttering and de-shuttering at an elevated metro station. Helmet, shoes and harness provided.",
        hi: "एलिवेटेड मेट्रो स्टेशन पर शटरिंग और डी-शटरिंग में बढ़ई की मदद। हेलमेट, जूते और हार्नेस दिए जाएँगे।",
        mr: "उन्नत मेट्रो स्टेशनवर शटरिंग व डी-शटरिंगमध्ये सुतारांना मदत. हेल्मेट, बूट आणि हार्नेस दिले जातील.",
      },
      employerName: "Konkan Infra Contractors",
      owner: "seed",
      area: "borivali",
      address: { en: "Western Express Highway, Borivali East", hi: "वेस्टर्न एक्सप्रेस हाईवे, बोरीवली पूर्व", mr: "वेस्टर्न एक्सप्रेस हायवे, बोरिवली पूर्व" },
      wage: 750, wageUnit: "day", duration: "threeMonths", paymentTerm: "weekly", paymentMode: "bank",
      workersNeeded: 15, experienceMin: 0, hours: "21:00 – 06:00",
      benefits: ["safetyGear", "meals", "transport"], ageH: 11, startIn: 2,
    }),
    j({
      id: "job-015",
      trade: "electrician",
      title: { en: "Maintenance electrician – housing society", hi: "मेंटेनेंस इलेक्ट्रीशियन – हाउसिंग सोसायटी", mr: "देखभाल इलेक्ट्रिशियन – गृहनिर्माण सोसायटी" },
      description: {
        en: "Day-time maintenance for a 6-building society: common lighting, pumps, lift panel coordination with vendor.",
        hi: "6 इमारतों वाली सोसायटी का दिन का मेंटेनेंस: कॉमन लाइटिंग, पंप, लिफ़्ट पैनल के लिए वेंडर से तालमेल।",
        mr: "6 इमारतींच्या सोसायटीची दिवसाची देखभाल: सामायिक दिवे, पंप, लिफ्ट पॅनलसाठी व्हेंडरशी समन्वय.",
      },
      employerName: "Lake View CHS",
      owner: "seed",
      area: "mulund",
      address: { en: "LBS Marg, Mulund West", hi: "LBS मार्ग, मुलुंड पश्चिम", mr: "LBS मार्ग, मुलुंड पश्चिम" },
      wage: 20000, wageUnit: "month", duration: "ongoing", paymentTerm: "monthly", paymentMode: "bank",
      workersNeeded: 1, experienceMin: 3, hours: "09:00 – 18:00",
      benefits: [], ageH: 60, startIn: 8,
    }),
    j({
      id: "job-016",
      trade: "painter",
      title: { en: "Interior painter – 3BHK flat", hi: "इंटीरियर पेंटर – 3BHK फ़्लैट", mr: "इंटिरियर रंगारी – 3BHK फ्लॅट" },
      description: {
        en: "Putty, primer and two coats of emulsion in a vacant 3BHK. Paint and rollers supplied by the owner.",
        hi: "ख़ाली 3BHK में पुट्टी, प्राइमर और इमल्शन के दो कोट। पेंट और रोलर मालिक देंगे।",
        mr: "रिकाम्या 3BHK मध्ये पुट्टी, प्रायमर आणि इमल्शनचे दोन कोट. रंग व रोलर मालक देतील.",
      },
      employerName: "Private owner (Fernandes)",
      owner: "seed",
      area: "colaba",
      address: { en: "Cuffe Parade, Colaba", hi: "कफ़ परेड, कोलाबा", mr: "कफ परेड, कुलाबा" },
      wage: 24000, wageUnit: "task", duration: "week", paymentTerm: "onCompletion", paymentMode: "upi",
      workersNeeded: 2, experienceMin: 2, hours: "09:00 – 18:00",
      benefits: ["transport"], ageH: 2, startIn: 3,
    }),
  ];
}

export const SEED_WORKERS: WorkerProfile[] = [
  { id: "w-01", name: "Ramesh Jadhav", phone: "98XXXXXX21", trade: "mason", otherTrades: ["tiler"], area: "dadar", experience: 9, expectedWage: 950, availability: "now", languages: ["mr", "hi"], about: "Brick, block and plaster work. Worked on 4 high-rise projects in Parel and Worli.", owner: "seed" },
  { id: "w-02", name: "Sunita Kamble", phone: "97XXXXXX45", trade: "housekeeping", otherTrades: ["cook"], area: "andheri", experience: 5, expectedWage: 16000, availability: "week", languages: ["mr", "hi"], about: "Hospital and office housekeeping. Comfortable with night shifts.", owner: "seed" },
  { id: "w-03", name: "Mohammed Irfan Shaikh", phone: "99XXXXXX08", trade: "electrician", otherTrades: [], area: "kurla", experience: 7, expectedWage: 1150, availability: "now", languages: ["hi", "en"], about: "ITI electrician. Conduit wiring, DB and panel work for commercial fit-outs.", owner: "seed" },
  { id: "w-04", name: "Santosh Yadav", phone: "88XXXXXX67", trade: "helper", otherTrades: ["painter"], area: "ghatkopar", experience: 2, expectedWage: 700, availability: "now", languages: ["hi"], about: "Material shifting, mixing and site cleaning. Can start tomorrow.", owner: "seed" },
  { id: "w-05", name: "Prakash Gaikwad", phone: "90XXXXXX12", trade: "carpenter", otherTrades: [], area: "powai", experience: 12, expectedWage: 1200, availability: "month", languages: ["mr", "hi"], about: "Modular kitchens, wardrobes and shuttering. Own power tools.", owner: "seed" },
  { id: "w-06", name: "Anil Vishwakarma", phone: "93XXXXXX90", trade: "welder", otherTrades: ["helper"], area: "kurla", experience: 6, expectedWage: 1000, availability: "week", languages: ["hi"], about: "Arc welding for grills, gates and railings. Workshop and site experience.", owner: "seed" },
  { id: "w-07", name: "Lakshmi Naidu", phone: "96XXXXXX33", trade: "cook", otherTrades: ["housekeeping"], area: "chembur", experience: 8, expectedWage: 15000, availability: "now", languages: ["hi", "mr", "en"], about: "Cooked for canteens of 100+ people. South and North Indian meals.", owner: "seed" },
  { id: "w-08", name: "Vijay Pawar", phone: "91XXXXXX76", trade: "painter", otherTrades: [], area: "thane", experience: 4, expectedWage: 850, availability: "now", languages: ["mr"], about: "Interior and exterior painting, cradle work trained.", owner: "seed" },
  { id: "w-09", name: "Dinesh Chauhan", phone: "70XXXXXX54", trade: "driver", otherTrades: [], area: "mulund", experience: 10, expectedWage: 21000, availability: "week", languages: ["hi", "mr"], about: "Transport licence holder. Tempo and pickup driving across MMR.", owner: "seed" },
  { id: "w-10", name: "Rafiq Ansari", phone: "86XXXXXX19", trade: "plumber", otherTrades: ["tiler"], area: "bandra", experience: 11, expectedWage: 1100, availability: "now", languages: ["hi", "en"], about: "CPVC, GI and concealed plumbing. Bathroom renovations end to end.", owner: "seed" },
  { id: "w-11", name: "Ganesh More", phone: "95XXXXXX28", trade: "tiler", otherTrades: ["mason"], area: "malad", experience: 5, expectedWage: 1000, availability: "now", languages: ["mr", "hi"], about: "Large-format vitrified tiles, levelling systems, granite cutting.", owner: "seed" },
  { id: "w-12", name: "Kavita Shinde", phone: "89XXXXXX61", trade: "security", otherTrades: ["housekeeping"], area: "vashi", experience: 3, expectedWage: 17000, availability: "week", languages: ["mr", "hi"], about: "Gate duty and visitor register at residential and warehouse sites.", owner: "seed" },
  { id: "w-13", name: "Babulal Prajapati", phone: "82XXXXXX03", trade: "mason", otherTrades: ["helper"], area: "goregaon", experience: 4, expectedWage: 900, availability: "now", languages: ["hi"], about: "AAC block work and plaster. Worked with Goregaon builders for 3 years.", owner: "seed" },
];

/** Interest already expressed by seed workers on jobs owned by the local employer. */
export function buildSeedApplications(now: number): Application[] {
  const a = (id: string, jobId: string, workerId: string, ageH: number, status: Application["status"] = "interested"): Application => ({
    id, jobId, workerId, status, createdAt: now - ageH * HOUR,
  });
  return [
    a("app-s1", "job-001", "w-01", 2, "shortlisted"),
    a("app-s2", "job-001", "w-13", 1),
    a("app-s3", "job-001", "w-11", 2.5),
    a("app-s4", "job-005", "w-08", 20),
    a("app-s5", "job-005", "w-04", 12),
    a("app-s6", "job-009", "w-11", 6),
    a("app-s7", "job-009", "w-10", 9),
  ];
}
