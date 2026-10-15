import type { GuideId } from "../audio-guides";
import type { Lang } from "../types";

export type FaqCat = "start" | "work" | "safety" | "employers" | "mobile";

/** Shared structure; text lives per language below. `audio` links a prerecorded clip when one fits. */
export const FAQ_ITEMS = [
  { id: "find-work", cat: "start", audio: "find-work" },
  { id: "resume", cat: "start" },
  { id: "free", cat: "start" },
  { id: "language", cat: "start" },
  { id: "apply", cat: "work", audio: "job-details" },
  { id: "near", cat: "work" },
  { id: "shortlisted", cat: "work" },
  { id: "after-accept", cat: "work", audio: "ticket-help" },
  { id: "wages", cat: "safety", audio: "payment-terms" },
  { id: "pay-to-get", cat: "safety" },
  { id: "terms-change", cat: "safety" },
  { id: "report", cat: "safety" },
  { id: "hire", cat: "employers" },
  { id: "offer", cat: "employers" },
  { id: "confirm", cat: "employers" },
  { id: "edit", cat: "employers" },
  { id: "install", cat: "mobile" },
  { id: "android", cat: "mobile" },
  { id: "offline", cat: "mobile" },
  { id: "audio", cat: "mobile" },
] as const satisfies readonly { id: string; cat: FaqCat; audio?: GuideId }[];

export type FaqId = (typeof FAQ_ITEMS)[number]["id"];
type FaqText = Record<FaqId, { q: string; a: string }>;

const en: FaqText = {
  "find-work": { q: "How do I find work?", a: "Tap “I want work”. Choose your language, your trade, your area and your experience. You will see jobs sorted by distance. Open a job and tap “I’m interested”." },
  resume: { q: "Do I need a résumé?", a: "No. UMANG makes a simple skill card from your answers — trade, years of experience, area, languages and expected pay. Employers see this card instead of a résumé." },
  free: { q: "Is UMANG free for workers?", a: "Yes. This prototype does not charge workers anything. If anyone asks you for money to get a job, do not pay." },
  language: { q: "How do I change my language?", a: "Use the EN / हिं / मरा buttons at the top of any screen. Your choice is saved on this device." },
  apply: { q: "How do I apply?", a: "Open a job, read the pay and terms, then tap “I’m interested”. The employer sees your skill card. You can withdraw any time before you accept an offer." },
  near: { q: "How do I find jobs near me?", a: "During setup you choose your home area. Jobs are sorted by distance from it. You can also filter by area, work type and minimum pay. Distances are approximate." },
  shortlisted: { q: "What does shortlisted mean?", a: "The employer liked your profile and may send you an offer. It is not a confirmed job. Wait for an offer before you travel to the site." },
  "after-accept": { q: "What happens after I accept an offer?", a: "UMANG creates a job ticket with the agreed pay, timing and place. From the ticket, you can contact the employer by WhatsApp, SMS or call. The ticket is not a contract or proof of payment." },
  wages: { q: "How do I check my wages?", a: "Every job shows the pay, how it is counted (per day, per month or for the whole job), when you will be paid and how. Your job ticket keeps the agreed terms. See the Rights page about minimum wages." },
  "pay-to-get": { q: "Should I pay to get a job?", a: "Never. A real employer will not ask you for money to give you work. Do not pay, and report it." },
  "terms-change": { q: "What should I do if payment terms change?", a: "Your job ticket shows the terms agreed in UMANG. Show it to the employer and talk. If you are not paid what is due, contact the Labour Commissioner’s office. UMANG cannot force anyone to pay." },
  report: { q: "How can I report a suspicious job?", a: "This prototype does not have a reporting button yet. Do not pay money or hand over documents. Note the details and report it to the police (112) or the labour office." },
  hire: { q: "How do I hire someone?", a: "Tap “I want to hire”, add your details and post a job with clear pay. Interested workers appear on the job page. Review their skill cards, shortlist them and send an offer." },
  offer: { q: "How do I send an offer?", a: "Open your job and tap “Send offer” next to a worker. Check the wage, start date, hours, tools and instructions, and agree to share your number. The worker then accepts or declines." },
  confirm: { q: "How do I confirm a hire?", a: "The hire is confirmed when the worker accepts your offer. UMANG then creates one job ticket for both of you. After that you can mark the work as started and completed." },
  edit: { q: "How can I edit a job?", a: "Open the job from Listings and tap “Edit job”. Changes update the listing. Offers you already sent keep the terms they were sent with." },
  install: { q: "How do I install UMANG?", a: "On Android, open UMANG in Chrome and choose “Install app” from the ⋮ menu. On iPhone, open it in Safari and use Share → Add to Home Screen. The Install page has step-by-step help." },
  android: { q: "Will it work on Android?", a: "Yes. UMANG runs in Chrome on Android and can be added to your home screen. Installing needs a secure https:// address." },
  offline: { q: "Can I use UMANG without internet?", a: "Partly. After you open UMANG once with internet, pages you visited may open offline, and your profile and saved jobs stay on this phone. In this demo all data lives only on your device, so nothing new arrives from other people." },
  audio: { q: "How do I listen to audio guidance?", a: "Tap “Listen to this” wherever you see the speaker button. Recorded guidance plays where it is available. Otherwise you can choose the device voice, which is computer-generated." },
};

const hi: FaqText = {
  "find-work": { q: "मुझे काम कैसे मिलेगा?", a: "“मुझे काम चाहिए” दबाएँ। अपनी भाषा, काम, इलाका और अनुभव चुनें। आपको दूरी के हिसाब से काम दिखेंगे। कोई काम खोलें और “मुझे यह काम चाहिए” दबाएँ।" },
  resume: { q: "क्या मुझे बायोडाटा चाहिए?", a: "नहीं। UMANG आपके जवाबों से एक आसान स्किल कार्ड बनाता है — काम, अनुभव के साल, इलाका, भाषाएँ और अपेक्षित मज़दूरी। नियोक्ता बायोडाटा की जगह यही कार्ड देखते हैं।" },
  free: { q: "क्या UMANG कामगारों के लिए मुफ़्त है?", a: "हाँ। यह प्रोटोटाइप कामगारों से कोई पैसा नहीं लेता। अगर कोई काम दिलाने के लिए पैसे माँगे, तो न दें।" },
  language: { q: "अपनी भाषा कैसे बदलूँ?", a: "किसी भी स्क्रीन के ऊपर EN / हिं / मरा बटन इस्तेमाल करें। आपकी पसंद इसी डिवाइस पर सेव रहती है।" },
  apply: { q: "आवेदन कैसे करूँ?", a: "कोई काम खोलें, मज़दूरी और शर्तें पढ़ें, फिर “मुझे यह काम चाहिए” दबाएँ। नियोक्ता आपका स्किल कार्ड देखेंगे। ऑफ़र स्वीकार करने से पहले आप कभी भी रुचि वापस ले सकते हैं।" },
  near: { q: "पास के काम कैसे खोजूँ?", a: "शुरुआत में आप अपना घर का इलाका चुनते हैं। काम उससे दूरी के हिसाब से दिखते हैं। आप इलाका, काम का प्रकार और कम से कम मज़दूरी से भी फ़िल्टर कर सकते हैं। दूरी अनुमानित है।" },
  shortlisted: { q: "शॉर्टलिस्ट का क्या मतलब है?", a: "नियोक्ता को आपकी प्रोफ़ाइल पसंद आई और वे ऑफ़र भेज सकते हैं। यह पक्का काम नहीं है। साइट पर जाने से पहले ऑफ़र का इंतज़ार करें।" },
  "after-accept": { q: "ऑफ़र स्वीकार करने के बाद क्या होता है?", a: "UMANG तय मज़दूरी, समय और जगह के साथ एक जॉब टिकट बनाता है। टिकट से आप नियोक्ता से WhatsApp, SMS या कॉल पर संपर्क कर सकते हैं। टिकट अनुबंध या भुगतान का सबूत नहीं है।" },
  wages: { q: "अपनी मज़दूरी कैसे जाँचूँ?", a: "हर काम में मज़दूरी, उसका हिसाब (प्रति दिन, प्रति माह या पूरे काम का), भुगतान कब और कैसे होगा — सब दिखता है। आपका जॉब टिकट तय शर्तें रखता है। न्यूनतम मज़दूरी के लिए अधिकार पेज देखें।" },
  "pay-to-get": { q: "क्या काम पाने के लिए पैसे देने चाहिए?", a: "कभी नहीं। असली नियोक्ता काम देने के लिए पैसे नहीं माँगेगा। पैसे न दें और शिकायत करें।" },
  "terms-change": { q: "भुगतान की शर्तें बदल जाएँ तो क्या करूँ?", a: "आपका जॉब टिकट UMANG में तय शर्तें दिखाता है। उसे नियोक्ता को दिखाकर बात करें। अगर बकाया पैसा न मिले, तो श्रम आयुक्त कार्यालय से संपर्क करें। UMANG किसी को भुगतान के लिए मजबूर नहीं कर सकता।" },
  report: { q: "संदिग्ध काम की शिकायत कैसे करूँ?", a: "इस प्रोटोटाइप में अभी शिकायत का बटन नहीं है। पैसे या दस्तावेज़ न दें। जानकारी लिख लें और पुलिस (112) या श्रम कार्यालय में शिकायत करें।" },
  hire: { q: "किसी को काम पर कैसे रखूँ?", a: "“मुझे कामगार चाहिए” दबाएँ, अपनी जानकारी जोड़ें और साफ़ मज़दूरी के साथ काम डालें। इच्छुक कामगार काम के पेज पर दिखेंगे। उनके स्किल कार्ड देखें, शॉर्टलिस्ट करें और ऑफ़र भेजें।" },
  offer: { q: "ऑफ़र कैसे भेजूँ?", a: "अपना काम खोलें और कामगार के आगे “ऑफ़र भेजें” दबाएँ। मज़दूरी, शुरू की तारीख़, समय, औज़ार और निर्देश जाँचें, और अपना नंबर साझा करने की सहमति दें। फिर कामगार स्वीकार या मना करेंगे।" },
  confirm: { q: "भर्ती पक्की कैसे करूँ?", a: "कामगार के आपका ऑफ़र स्वीकार करते ही भर्ती पक्की हो जाती है। फिर UMANG आप दोनों के लिए एक जॉब टिकट बनाता है। उसके बाद आप काम शुरू और पूरा होना दर्ज कर सकते हैं।" },
  edit: { q: "काम में बदलाव कैसे करूँ?", a: "लिस्टिंग से काम खोलें और “काम बदलें” दबाएँ। बदलाव लिस्टिंग पर लागू होते हैं। पहले भेजे गए ऑफ़र अपनी भेजी गई शर्तों पर ही रहते हैं।" },
  install: { q: "UMANG कैसे इंस्टॉल करूँ?", a: "Android पर Chrome में UMANG खोलें और ⋮ मेन्यू से “ऐप इंस्टॉल करें” चुनें। iPhone पर Safari में खोलें और शेयर → Add to Home Screen इस्तेमाल करें। इंस्टॉल पेज पर हर कदम बताया है।" },
  android: { q: "क्या यह Android पर चलेगा?", a: "हाँ। UMANG Android पर Chrome में चलता है और होम स्क्रीन पर जोड़ा जा सकता है। इंस्टॉल के लिए सुरक्षित https:// पता चाहिए।" },
  offline: { q: "क्या बिना इंटरनेट UMANG चलेगा?", a: "कुछ हद तक। इंटरनेट के साथ एक बार खोलने के बाद देखे गए पेज ऑफ़लाइन खुल सकते हैं, और आपकी प्रोफ़ाइल व सेव किए काम इसी फ़ोन पर रहते हैं। इस डेमो में सारा डेटा सिर्फ़ आपके डिवाइस पर है, इसलिए दूसरों से कुछ नया नहीं आता।" },
  audio: { q: "ऑडियो मदद कैसे सुनूँ?", a: "जहाँ भी स्पीकर बटन दिखे, “यह सुनें” दबाएँ। जहाँ रिकॉर्ड की गई आवाज़ उपलब्ध है, वह चलेगी। नहीं तो आप डिवाइस की आवाज़ चुन सकते हैं, जो कंप्यूटर से बनी होती है।" },
};

const mr: FaqText = {
  "find-work": { q: "मला काम कसे मिळेल?", a: "“मला काम हवे” दाबा. तुमची भाषा, काम, परिसर आणि अनुभव निवडा. तुम्हाला अंतरानुसार कामे दिसतील. एखादे काम उघडा आणि “मला हे काम हवे” दाबा." },
  resume: { q: "मला बायोडेटा लागेल का?", a: "नाही. UMANG तुमच्या उत्तरांवरून एक सोपे कौशल्य कार्ड बनवते — काम, अनुभवाची वर्षे, परिसर, भाषा आणि अपेक्षित मजुरी. मालक बायोडेटाऐवजी हेच कार्ड पाहतात." },
  free: { q: "UMANG कामगारांसाठी मोफत आहे का?", a: "हो. हा प्रोटोटाइप कामगारांकडून कोणतेही पैसे घेत नाही. काम मिळवून देण्यासाठी कोणी पैसे मागितल्यास देऊ नका." },
  language: { q: "माझी भाषा कशी बदलू?", a: "कोणत्याही स्क्रीनच्या वर EN / हिं / मरा बटणे वापरा. तुमची निवड याच डिव्हाइसवर जतन राहते." },
  apply: { q: "अर्ज कसा करू?", a: "एखादे काम उघडा, मजुरी आणि अटी वाचा, मग “मला हे काम हवे” दाबा. मालक तुमचे कौशल्य कार्ड पाहतील. ऑफर स्वीकारण्यापूर्वी तुम्ही केव्हाही स्वारस्य मागे घेऊ शकता." },
  near: { q: "जवळची कामे कशी शोधू?", a: "सुरुवातीला तुम्ही तुमचा घराचा परिसर निवडता. कामे त्यापासूनच्या अंतरानुसार दिसतात. परिसर, कामाचा प्रकार आणि किमान मजुरीनुसारही फिल्टर करता येते. अंतर अंदाजे आहे." },
  shortlisted: { q: "निवड यादीत म्हणजे काय?", a: "मालकांना तुमची प्रोफाइल आवडली आणि ते ऑफर पाठवू शकतात. हे निश्चित काम नाही. साइटवर जाण्यापूर्वी ऑफरची वाट पहा." },
  "after-accept": { q: "ऑफर स्वीकारल्यानंतर काय होते?", a: "UMANG ठरलेली मजुरी, वेळ आणि ठिकाणासह एक जॉब तिकीट तयार करते. तिकिटावरून तुम्ही मालकाशी WhatsApp, SMS किंवा कॉलने संपर्क करू शकता. तिकीट हा करार किंवा पैसे दिल्याचा पुरावा नाही." },
  wages: { q: "माझी मजुरी कशी तपासू?", a: "प्रत्येक कामात मजुरी, तिचा हिशोब (दररोज, दरमहा किंवा संपूर्ण कामाचा), पैसे कधी आणि कसे मिळतील हे दिसते. तुमचे जॉब तिकीट ठरलेल्या अटी जपते. किमान वेतनासाठी हक्क पान पहा." },
  "pay-to-get": { q: "काम मिळवण्यासाठी पैसे द्यावेत का?", a: "कधीही नाही. खरा मालक काम देण्यासाठी पैसे मागणार नाही. पैसे देऊ नका आणि तक्रार करा." },
  "terms-change": { q: "पैशांच्या अटी बदलल्या तर काय करू?", a: "तुमचे जॉब तिकीट UMANG मध्ये ठरलेल्या अटी दाखवते. ते मालकाला दाखवून बोला. देय पैसे न मिळाल्यास कामगार आयुक्त कार्यालयाशी संपर्क करा. UMANG कोणालाही पैसे देण्यास भाग पाडू शकत नाही." },
  report: { q: "संशयास्पद कामाची तक्रार कशी करू?", a: "या प्रोटोटाइपमध्ये अजून तक्रारीचे बटण नाही. पैसे किंवा कागदपत्रे देऊ नका. माहिती लिहून ठेवा आणि पोलीस (112) किंवा कामगार कार्यालयात तक्रार करा." },
  hire: { q: "एखाद्याला कामावर कसे घेऊ?", a: "“मला कामगार हवेत” दाबा, तुमची माहिती जोडा आणि स्पष्ट मजुरीसह काम टाका. इच्छुक कामगार कामाच्या पानावर दिसतील. त्यांची कौशल्य कार्डे पहा, निवड यादीत टाका आणि ऑफर पाठवा." },
  offer: { q: "ऑफर कशी पाठवू?", a: "तुमचे काम उघडा आणि कामगारासमोर “ऑफर पाठवा” दाबा. मजुरी, सुरुवातीची तारीख, वेळ, हत्यारे आणि सूचना तपासा, आणि नंबर शेअर करण्यास संमती द्या. मग कामगार स्वीकारतील किंवा नाकारतील." },
  confirm: { q: "भरती निश्चित कशी करू?", a: "कामगाराने तुमची ऑफर स्वीकारताच भरती निश्चित होते. मग UMANG तुम्हा दोघांसाठी एक जॉब तिकीट तयार करते. त्यानंतर तुम्ही काम सुरू व पूर्ण झाल्याची नोंद करू शकता." },
  edit: { q: "कामात बदल कसा करू?", a: "जाहिरातींमधून काम उघडा आणि “काम बदला” दाबा. बदल जाहिरातीला लागू होतात. आधी पाठवलेल्या ऑफर त्यांच्या पाठवलेल्या अटींवरच राहतात." },
  install: { q: "UMANG कसे इन्स्टॉल करू?", a: "Android वर Chrome मध्ये UMANG उघडा आणि ⋮ मेनूतून “अ‍ॅप इन्स्टॉल करा” निवडा. iPhone वर Safari मध्ये उघडा आणि शेअर → Add to Home Screen वापरा. इन्स्टॉल पानावर प्रत्येक पायरी दिली आहे." },
  android: { q: "हे Android वर चालेल का?", a: "हो. UMANG Android वर Chrome मध्ये चालते आणि होम स्क्रीनवर जोडता येते. इन्स्टॉल करण्यासाठी सुरक्षित https:// पत्ता लागतो." },
  offline: { q: "इंटरनेटशिवाय UMANG वापरता येईल का?", a: "काही प्रमाणात. इंटरनेटसह एकदा उघडल्यानंतर पाहिलेली पाने ऑफलाइन उघडू शकतात, आणि तुमची प्रोफाइल व जतन केलेली कामे याच फोनवर राहतात. या डेमोमध्ये सर्व डेटा फक्त तुमच्या डिव्हाइसवर आहे, त्यामुळे इतरांकडून काही नवीन येत नाही." },
  audio: { q: "ऑडिओ मार्गदर्शन कसे ऐकू?", a: "जिथे स्पीकर बटण दिसेल तिथे “हे ऐका” दाबा. जिथे रेकॉर्ड केलेले मार्गदर्शन उपलब्ध आहे ते वाजेल. नाहीतर तुम्ही डिव्हाइसचा आवाज निवडू शकता, जो संगणकनिर्मित असतो." },
};

export const FAQ_TEXT: Record<Lang, FaqText> = { en, hi, mr };
