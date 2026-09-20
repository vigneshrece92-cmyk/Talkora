
"use strict";
/* ============================================================
   VAZHKAM — 5-language voice learning app
   en (English) · ta (தமிழ்) · hi (हिन्दी) · ml (മലയാളം) · fr (Français)
   ============================================================ */

/* ---------------- LANGUAGES ---------------- */
const LANGS = {
  en:{name:"English", native:"English", stt:"en-IN", tts:"en-IN", voices:[/^en[-_]IN/i,/^en[-_]GB/i,/^en[-_]US/i,/^en/i]},
  ta:{name:"Tamil", native:"தமிழ்", stt:"ta-IN", tts:"ta-IN", voices:[/^ta[-_]IN/i,/^ta/i]},
  hi:{name:"Hindi", native:"हिन्दी", stt:"hi-IN", tts:"hi-IN", voices:[/^hi[-_]IN/i,/^hi/i]},
  ml:{name:"Malayalam", native:"മലയാളം", stt:"ml-IN", tts:"ml-IN", voices:[/^ml[-_]IN/i,/^ml/i]},
  fr:{name:"French", native:"Français", stt:"fr-FR", tts:"fr-FR", voices:[/^fr[-_]FR/i,/^fr[-_]CA/i,/^fr/i]},
};
const LCODES = ["en","ta","hi","ml","fr"];

/* ---------------- DICTIONARY ----------------
   RAW rows: [id, cat, "w"|"p", en, ta, hi, ml, fr]  ·  "text|translit" */
const RAW = [
 // greetings
 ["g1","greetings","w","Hello","வணக்கம்|vanakkam","नमस्ते|namaste","നമസ്കാരം|namaskāram","Bonjour"],
 ["g2","greetings","w","Good morning","நல்ல காலை|nalla kaalai","सुप्रभात|suprabhāat","നല്ല രാവിലെ|nalla rāvilē","Bonjour (matin)"],
 ["g3","greetings","w","Good evening","நல்ல மாலை|nalla maalai","शुभ संध्या|shubha sandhyā","നല്ല വൈകുന്നേരം|nalla vaikkunnēraṁ","Bonsoir"],
 ["g4","greetings","w","Good night","நல்ல இரவு|nalla iravu","शुभ रात्रि|shubha rātri","നല്ല രാത്രി|nalla rāthri","Bonne nuit"],
 ["g5","greetings","w","Thank you","நன்றி|nandri","धन्यवाद|dhanyavāad","നന്ദി|nandi","Merci"],
 ["g6","greetings","w","You're welcome","எதுவும் வேண்டாம்|edhuvum venndham","कोई बात नहीं|koi baat nahīṁ","വേണ്ട|veṇṇa","Je vous en prie"],
 ["g7","greetings","w","Sorry","மன்னிக்கவும்|mannikkavum","माफ़ कीजिए|māf kijiye","ക്ഷമിക്കണം|kshamikkaṇam","Désolé"],
 ["g8","greetings","w","Please","தயவு|dhayavu","कृपया|kṛpayā","ദയവു|dhayavu","S'il vous plaît"],
 ["g9","greetings","w","Yes","ஆம்|āṁ","हाँ|hāṁ","അതെ|athē","Oui"],
 ["g10","greetings","w","No","இல்லை|illai","नहीं|nahīṁ","ഇല്ല|illā","Non"],
 ["g11","greetings","w","Welcome","வரவேற்கிறோம்|varaveeruginrom","स्वागत है|svāgat hai","സ്വാഗതം|svāgaṭaṁ","Bienvenue"],
 // people & self
 ["p1","people","w","Name","பெயர்|peyar","नाम|nām","പേര്|pēṟ","Nom"],
 ["p2","people","w","I","நான்|nān","मैं|main","ഞാൻ|jñān","Je"],
 ["p3","people","w","You","நீங்கள்|neenga","आप|aap","നിങ്ങൾ|niṅgḷṛ","Vous"],
 ["p4","people","w","He","அவன்|avaan","वह|vah","അദ്ദേഹം|addēhaṁ","Il"],
 ["p5","people","w","She","அவள்|avaal","वह|vah","അവൾ|avaḷ","Elle"],
 ["p6","people","w","Friend","நண்பர்|nanpar","दोस्त|dost","കൂട്ടുകാരൻ|kūṭṭukāraṇṁ","Ami"],
 ["p7","people","w","Home","வீடு|veedu","घर|ghar","വീട്|vīṭ","Maison"],
 ["p8","people","w","Country","நாடு|naadu","देश|dēsh","രാജ്യം|rājyam","Pays"],
 ["p9","people","w","Language","மொழி|mozhhi","भाषा|bhāṣā","ഭാഷ|bhāsha","Langue"],
 ["p10","people","w","To speak","பேசு|pesu","बोलना|bolnā","പറയുക|paṟayuka","Parler"],
 ["p11","people","w","To understand","புரி|puri","समझना|samajhnā","മനസ്സിലാക്കുക|manaṣṣilākkuka","Comprendre"],
 ["p12","people","w","To learn","கற்றுக்கொள்|karthukol","सीखना|sīkhnā","പഠിക്കുക|paṭhikkuka","Apprendre"],
 ["p13","people","w","Work","வேலை|vela","काम|kaam","ജോലി|jōli","Travail"],
 ["p14","people","w","Family","குடும்பம்|kudumbam","परिवार|parivaar","കുടുംബം|kuḍūmbam","Famille"],
 // food
 ["f1","food","w","Food","உணவு|unavu","खाना|khānā","ഭക്ഷണം|bhaikshanam","Nourriture"],
 ["f2","food","w","Water","தண்ணீர்|thanneer","पानी|pānī","വെള്ളം|vëllam","Eau"],
 ["f3","food","w","Rice","சாதம்|saadam","चावल|chāvaal","ചോറു|chōra","Riz"],
 ["f4","food","w","Bread","ரொட்டி|rotiy","रोटी|roṭī","അപ്പം|appam","Pain"],
 ["f5","food","w","Milk","பால்|paal","दूध|dūdh","പാൽ|pāl","Lait"],
 ["f6","food","w","Sugar","சர்க்காரை|sarkkarai","चीनी|chīnī","പഞ്ചസാര|pañchaśāra","Sucre"],
 ["f7","food","w","Salt","உப்பு|uppu","नमक|namak","ഉപ്പ്|uppe","Sel"],
 ["f8","food","w","Tea","தே|tē","चाय|chāy","ചായ|chāya","Thé"],
 ["f9","food","w","Coffee","காபி|kaapi","कॉफ़ी|kāphī","കാപ്പി|kāppi","Café"],
 ["f10","food","w","Fruit","பழம்|pazham","फल|phal","പഴം|paẓam","Fruit"],
 ["f11","food","w","Sweet","அடை|adai","मिठाई|mithāī","വീരം|vīram","Dessert"],
 ["f12","food","w","Hungry","பசி|pasippu","भूख|bhūkhh","തടി|ṭaḍi","Faim"],
 ["f13","food","w","Thirsty","தாகம்|thaagam","प्यास|pyās","ദാഹം|dāhaṁ","Soif"],
 ["f14","food","w","Tasty","சுவையான|suvaiyān","स्वादिष्ट|svādisht","രുചികരം|rucikaram","Délicieux"],
 ["f15","food","w","Bill","பில்லை|billai","बिल|bil","ബിൽ|bil","Addition"],
 ["f16","food","w","Menu","மெனு|menu","मेन्यू|menū","മെനു|menu","Menu"],
 ["f17","food","w","Vegetarian","வெஜி|veji","शाहजही|shāhjahi","സാത്വം|sātvam","Végétarien"],
 // travel
 ["t1","travel","w","Bus","பஸ்|bus","बस|bas","ബസ്|bas","Bus"],
 ["t2","travel","w","Train","ரயில்|rail","ट्रेन|train","ട്രെയിൻ|train","Train"],
 ["t3","travel","w","Airplane","விமானம்|vimanam","हवाई जहाज़|hawāī jahāz","വിമാനം|vimānam","Avion"],
 ["t4","travel","w","Ticket","டிக்கெட்|tikket","टिकट|tikat","ടിക്കറ്റ്|tikkeṭṭ","Billet"],
 ["t5","travel","w","Where","எங்கே|engae","कहाँ|kahaan","എവിടെ|evide","Où"],
 ["t6","travel","w","Here","இங்கு|ingku","यहाँ|yahaan","ഇവിടെ|ivide","Ici"],
 ["t7","travel","w","There","அங்கு|angku","वहाँ|vahaan","അവിടെ|avide","Là"],
 ["t8","travel","w","Left","இடது|idathu","बायें|bāyēṁ","ഇടത്ത്|iḍatt","Gauche"],
 ["t9","travel","w","Right","வலது|valathu","दाहिनेँ|dāhinēṁ","വലത്ത്|valatt","Droite"],
 ["t10","travel","w","Forward","முன்னே|munne","आगे|āge","മുന്നോട്ട്|munnoṭṭ","Devant"],
 ["t11","travel","w","Car","வண்டி|vandi","कार|kār","കാർ|kār","Voiture"],
 ["t12","travel","w","Hotel","ஹோட்ரல்|hoṭṭal","होटल|hoṭal","ഹോട്ടൽ|hoṭṭal","Hôtel"],
 ["t13","travel","w","Road","பாடை|paadai","सड़क|saḍak","വഴി|vaẓi","Route"],
 ["t14","travel","w","Airport","விமான நிலையம்|viman nilayam","हवाई अड्डा|hawāī aḍḍā","ഏര്പോർട്ട്|ērapoṛṭṭ","Aéroport"],
 // shopping
 ["s1","shopping","w","Shop","கடை|kadai","दुकान|dukān","കട|kaḍḍ","Magasin"],
 ["s2","shopping","w","Price","விலை|vilai","कीमत|keemat","വില|vila","Prix"],
 ["s3","shopping","w","Money","பணம்|panam","पैसा|paisā","പണം|paṇam","Argent"],
 ["s4","shopping","w","Cash","ரொக்கம்|rokkam","नक़्दी|naqṛdī","റക്കം|raṭṭam","Espèces"],
 ["s5","shopping","w","To buy","வாங்கு|vaangu","खरीदना|kharīdnā","വാങ്ങുക|vāṅguka","Acheter"],
 ["s6","shopping","w","Expensive","விலையுயர்ந்த|vilai uyarntha","महंगा|mahangā","വിലയേറിയ|vilayēriya","Cher"],
 ["s7","shopping","w","Discount","தள்ளுபடி|ṭalluppadi","छूट|chhūṭ","കിഴിവു|kiẓivu","Réduction"],
 ["s8","shopping","w","Bag","பை|bai","बैग|baig","ബാഗ്|bāg","Sac"],
 // time
 ["d1","time","w","Today","இன்று|indru","आज|aaj","ഇന്ന്|innā","Aujourd'hui"],
 ["d2","time","w","Tomorrow","நாளை|naalai","कल|kal","നാളെ|nāle","Demain"],
 ["d3","time","w","Yesterday","நேற்று|netru","बीता कल|bītā kal","ഇന്നലെ|innalē","Hier"],
 ["d4","time","w","Morning","காலை|kaalai","सुबह|subah","രാവിലെ|rāvilē","Matin"],
 ["d5","time","w","Noon","மதியம்|madhyam","दोपहर|doaphar","ഉച്ച|ucca","Midi"],
 ["d6","time","w","Evening","மாலை|maalai","शाम|shām","വൈകുന്നേരം|vaikkunnēraṁ","Soir"],
 ["d7","time","w","Night","இரவு|iravu","रात|rāt","രാത്രി|rāthri","Nuit"],
 ["d8","time","w","Day","நாள்|naal","दिन|din","ദിവസം|divaṣam","Jour"],
 ["d9","time","w","Week","வாரம்|vaaram","हफ़्ता|haphṭā","വാരം|vāraṁ","Semaine"],
 ["d10","time","w","Month","மாதம்|maadham","महीना|mahīnā","മാസം|māsaṁ","Mois"],
 ["d11","time","w","Year","ஆண்டு|aandu","साल|sāl","വർഷം|varshaṁ","Année"],
 ["d12","time","w","Hour","மணி|mani","घंटा|ghantā","മണി|maṇi","Heure"],
 ["d13","time","w","Minute","நிமிடம்|nimidam","मिनट|minat","മിനിറ്റ്|minitṭ","Minute"],
 ["d14","time","w","When","எப்போது|eppodhu","कब|kab","എപ്പോൾ|eppōḷ","Quand"],
 ["d15","time","w","Time","நேரம்|neeram","समय|samay","നേരം|nēraṁ","Temps"],
 // weather
 ["w1","weather","w","Rain","மழை|mazhai","बारिश|bārish","മഴ|maẓa","Pluie"],
 ["w2","weather","w","Sun","வெயில்|vaiyl","सूरज|sūraj","വെയിൽ|veyil","Soleil"],
 ["w3","weather","w","Hot","சூடான|sūdān","गर्म|garam","ചൂട്|chūṭṟḍ","Chaud"],
 ["w4","weather","w","Cold","குளிர்|kulir","ठंड|thand","തണുപ്പ്|ṭaṇuppu","Froid"],
 ["w5","weather","w","Cloud","மேகம்|megam","बादल|bādal","മേഘം|mēgham","Nuage"],
 ["w6","weather","w","Sky","வானம்|vaanam","आसमान|āsmān","ആകാശം|ākāśam","Ciel"],
 ["w7","weather","w","Wind","காற்று|kaatru","हवा|havā","കാറ്റ്|kāṭṭ","Vent"],
 // numbers
 ["n1","numbers","w","One","ஒன்று|onru","एक|ek","ഒന്ന്|oṇṇu","Un"],
 ["n2","numbers","w","Two","இரண்டு|irundu","दो|do","രണ്ട്|raṇṭṭ","Deux"],
 ["n3","numbers","w","Three","மஊன்ற்ு|moonru","तीन|tīn","മൂന്ന്|mūṇṇ","Trois"],
 ["n4","numbers","w","Four","நான்கு|naangu","चार|chār","നാല്|nāḷ","Quatre"],
 ["n5","numbers","w","Five","ஐந்து|ainthu","पाँच|pāñch","അഞ്ച്|añch","Cinq"],
 ["n6","numbers","w","Six","ஆறு|aar","छह|chhah","ആറ്|āṭṭ","Six"],
 ["n7","numbers","w","Seven","ஏழு|eizhu","सात|sāṭ","ഏഴ്|ēḷ","Sept"],
 ["n8","numbers","w","Eight","எட்டு|ett","आठ|āṭh","എട്ട്|eṭṭ","Huit"],
 ["n9","numbers","w","Nine","ஒன்பது|onbathu","नौ|nau","ഒൻപത്|oṉpaṭṭ","Neuf"],
 ["n10","numbers","w","Ten","பத்து|pattu","दस|das","പത്തു|pattu","Dix"],
 // emotions
 ["e1","emotions","w","Happy","மகிழ்ச்சி|magizhchchi","खुश|khush","സന്തോഷം|santaṣam","Heureux"],
 ["e2","emotions","w","Sad","வறுதத்தம்|varuththam","उदास|udās","വിഷമം|viṣamaṁ","Triste"],
 ["e3","emotions","w","Love","அன்பு|anbu","प्यार|pyār","സ്നേഹം|snehaṁ","Amour"],
 ["e4","emotions","w","Fear","பயம்|payam","डर|dar","ഭയം|bhayam","Peur"],
 ["e5","emotions","w","Peace","அமைதி|amaithi","शांति|shānti","ശാന്തി|shānti","Paix"],
 // family
 ["fa1","family","w","Mother","அம்மா|amma","माँ|mā","അമ്മ|amṁa","Mère"],
 ["fa2","family","w","Father","அப்பா|appa","पिता|pita","അച്ഛൻ|acchan","Père"],
 ["fa3","family","w","Sister","சகோதரி|sagodari","बहन|bahen","സഹോദരി|sahōdari","Sœur"],
 ["fa4","family","w","Brother","சகோதரன்|sagodaran","भाई|bhāī","സഹോദരൻ|sahōdaraṇṁ","Frère"],
 ["fa5","family","w","Child","குழந்தை|kuzhandhai","बच्चा|baccā","കുട്ടി|kuṭṭi","Enfant"],
 ["fa6","family","w","Wife","மனைவி|manaivi","पत्नी|patrī","ഭാര്യ|bhāryy","Femme"],
 ["fa7","family","w","Husband","கணவர்|kanavar","पति|pati","പതി|pati","Mari"],
 ["fa8","family","w","Son","மகன்|mahan","बेटा|beta","മകൻ|makan","Fils"],
 ["fa9","family","w","Daughter","மகள்|magal","बेटी|betī","മകൾ|makal","Fille"],
 ["fa10","family","w","Grandmother","பாட்டி|paatti","दादी|dāḍī","അമ്മാമ്മ|ammāmṁa","Grand-mère"],
 ["fa11","family","w","Grandfather","தாத்தா|thaathaa","दादा|dāda","താതാ|thāthā","Grand-père"],
 // colors
 ["c1","colors","w","Red","சிவப்பு|sivappu","लाल|lāl","ചുവപ്പ്|chuvappu","Rouge"],
 ["c2","colors","w","Green","பச்சை|pachchai","हरा|harā","പച്ച|paccha","Vert"],
 ["c3","colors","w","Blue","நீலம்|neelam","नीला|nīlā","നീല|nīla","Bleu"],
 ["c4","colors","w","Yellow","மஞ்சள்|manjal","पीला|pīlā","മഞ്ഞ|manja","Jaune"],
 ["c5","colors","w","White","வெளளையு|vellaai","सफ़ेद|saphēd","വെളുപ്പ്|veḷuppu","Blanc"],
 ["c6","colors","w","Black","கருப்பு|karuppu","काला|kālā","കറുപ്പ്|karuppu","Noir"],
 // body
 ["b1","body","w","Head","தலை|thaalai","सिर|sir","തല|thala","Tête"],
 ["b2","body","w","Eye","கண்|kan","आँख|āñkh","കണ്ണു|kaṇṇu","Œil"],
 ["b3","body","w","Hand","கை|kai","हाथ|hāth","കൈ|kai","Main"],
 ["b4","body","w","Foot","கால்|kaal","पैर|pair","കാൽ|kāḷ","Pied"],
 ["b5","body","w","Mouth","வாய்|vaai","मुँह|munhh","വായ്|vāy","Bouche"],
 ["b6","body","w","Nose","மஊக்கு|mooggu","नाक|nāk","മൂക്കു|mūkku","Nez"],
 // emergency
 ["h1","emergency","w","Help","உதவி|udhavi","मदद|madad","സഹായം|sahāyam","Aide"],
 ["h2","emergency","w","Doctor","மருத்துவர்|maruththavar","डॉक्टर|doktar","ഡോക്ടർ|ḍokṭar","Docteur"],
 ["h3","emergency","w","Hospital","மருத்துவமனை|maruththavanai","अस्पताल|aspatal","ഹോസ്പിറ്റൽ|hoṣpitṭal","Hôpital"],
 ["h4","emergency","w","Police","காவல்|kaaval","पुलिस|pulis","പോലീസ്|pōlīsa","Police"],
 ["h5","emergency","w","Fire","தீ|thii","आग|āg","തീ|thī","Feu"],
 ["h6","emergency","w","Danger","அபாயம்|apaayam","खतरा|khaṭarā","കെട|keṭa","Danger"],
 ["h7","emergency","w","Phone","போன்|pon","फ़ोन|phōn","ഫോൺ|phōn","Téléphone"],
 // ---------- PHRASES ----------
 ["ph1","greetings","p","How are you?","நீங்கள் எப்படி?|neenga eppadi?","आप कैसे हैं?|aap kaise haiṁ?","നിങ്ങൾ എങ്ങനെ?|niṅgḷṛ eṅganē?","Comment allez-vous ?"],
 ["ph2","greetings","p","I am fine","நான் நல்லதாக இருக்கிறேன்|naan nelladhaaga irukkiraen","मैं ठीक हूँ|main thīk hūṁ","ഞാൻ നല്ലതാണ്|jñān nallathān","Je vais bien"],
 ["ph3","greetings","p","What is your name?","உங்கள் பெயர் என்ன?|ungal peyar enna?","आपका नाम क्या है?|aapkā nām kyā hai?","നിങ്ങളുടെ പേര് എന്താണ്?|niṅgḷṛude pēṟ eñthāṇṇ?","Comment vous appelez-vous ?"],
 ["ph4","greetings","p","My name is…","என் பெயர் …|en peyar…","मेरा नाम …|mera nām…","എന്റെ പേര് …|eṇṭe pēṟ…","Je m'appelle…"],
 ["ph5","greetings","p","Nice to meet you","எங்களை சந்தித்ததில் மகிழ்ச்சி|engalai sandhithadhil magizhchchi","आपसे मिलकर खुशी हुई|aapse milkar khushī hūī","നിങ്ങളെ കാണാൻ സന്തോഷം|niṅgḷṛe kāṇāṁ santaṣam","Enchanté"],
 ["ph6","greetings","p","Where are you from?","எங்கிருந்து வந்தீர்கள்?|engirundu vandheergala?","आप कहाँ से हैं?|aap kahaan se haiṁ?","നിങ്ങൾ എവിടെനിന്നാണ്?|niṅgḷṛ evide-ninnāṇṇ?","D'où venez-vous ?"],
 ["ph7","greetings","p","I am from India","நான் இந்தியாவிலிருந்து வந்தேன்|naan indhiyavil irundu vanthan","मैं भारत से हूँ|main bhārat se hūṁ","ഞാൻ ഇന്ത്യയിൽ നിന്നാണ്|jñān inṭyil ninnāṇṇ","Je viens de l'Inde"],
 ["ph8","food","p","I am hungry","நான் பசிக்கிறேன்|naan pasichiraen","मुझे भूख लगी है|mujhe bhūkhh lagī hai","എനിക്ക് തടിയുണ്ട്|enikku ṭaḍiyuṇṭṭ","J'ai faim"],
 ["ph9","food","p","I want water","தண்ணீர் வேண்டும்|thanneer vendum","मुझे पानी चाहिए|mujhe pānī chāhiye","എനിക്ക് വെള്ളം വേണം|enikku vëllam vēṇaṁ","Je voudrais de l'eau, s'il vous plaît"],
 ["ph10","food","p","The food is very tasty","உணவு மிகவும் சுவையாக இருக்கிறது|unavu migavum suvaaiyaaga irukkiraadhu","खाना बहुत स्वादिष्ट है|khānā bahut svādisht hai","ഭക്ഷണം വളരെ രുചികരമാണ്|bhaikshanam vaḷare rucikaramāṇṇ","La nourriture est très délicieuse"],
 ["ph11","food","p","Menu please","மெனுவை கொடுங்கள்|menuvai kodunga","मेन्यू दीजिए|menu dījie","മെനു തരിണം|menu tariṇaṁ","Le menu, s'il vous plaît"],
 ["ph12","food","p","Bill please","பில்லை கொடுங்கள்|billai kodunga","बिल लाइए|bil lāīe","ബിൽ തരിണം|bil tariṇaṁ","L'addition, s'il vous plaît"],
 ["ph13","travel","p","Where is this?","இது எங்கே?|idhu engae?","यह कहाँ है?|yeh kahaan hai?","ഇത് എവിടെ?|itta evide?","Où est-ce ?"],
 ["ph14","travel","p","Where is the shop?","கடை எங்கே?|kadai engae?","दुकान कहाँ है?|dukān kahaan hai?","കട എവിടെ?|kaḍḍ evide?","Où est le magasin ?"],
 ["ph15","travel","p","Where is the bus stop?","பஸ் நிலையம் எங்கே?|bus nilayam engae?","बस स्टॉप कहाँ है?|bas ṣṭōp kahaan hai?","ബസ് സ്റ്റോപ്പ് എവിടെ?|bas stoṣṭṭ evide?","Où est l'arrêt de bus ?"],
 ["ph16","travel","p","How far is it?","இது எவ்வளவு தூரம்?|idhu evvalavu dhooram?","यह कितनी दूर है?|yeh kitnī dūr hai?","ഇത് എത്ര ദൂരം?|itta eṭra dūraṁ?","C'est loin d'ici ?"],
 ["ph17","time","p","What time is it?","இது எத்தனை மணி?|idhu ethanaa mani?","यह कितने बजे हैं?|yeh kitne bajē haiṁ?","ഇപ്പോൾ എത്ര മണി?|ippōḷ eṭra maṇi?","Quelle heure est-il ?"],
 ["ph18","shopping","p","How much is this?","இது எவ்வளவு?|idhu evvalavu?","यह कितने का है?|yeh kitne kā hai?","ഇത് എത്ര വില?|itta eṭra vila?","C'est combien ?"],
 ["ph19","shopping","p","It is too expensive","இது மிகவும் விலை உயர்ந்தது|idhu migavum vilai uyarandhadhu","यह बहुत महंगा है|yeh bahut mahangā hai","ഇത് വളരെ വിലയേറിയതാണ്|itta vaḷare vilayēriyatāṇṁ","C'est trop cher"],
 ["ph20","shopping","p","I want to buy this","நான் இதை வாங்க விரும்புகிறேன்|naan idhai vaangu virumbukiraen","मैं यह खरीदना चाहता हूँ|main yeh kharīdnā chāhtā hūṁ","ഇത് എനിക്ക് വേണം|itta enikku vēṇaṁ","Je voudrais acheter ceci"],
 ["ph21","weather","p","It is raining","இன்று மழை பெய்கிறது|indru mazhai peigiraadhu","बारिश हो रही है|bārish ho rahī hai","ഇപ്പോൾ മഴ പെയ്യുന്നു|ippōḷ maẓa peyyunu","Il pleut"],
 ["ph22","weather","p","Today is very hot","இன்று மிகவும் சூடாக உள்ளது|indru migavum soodaaga allaadhu","आज बहुत गर्म है|aaj bahut garam hai","ഇന്ന് വളരെ ചൂടാണ്|innā vaḷare chūṭāṇṁ","Il fait très chaud aujourd'hui"],
 ["ph23","emotions","p","I am happy","நான் மகிழ்ச்சியாக இருக்கிறேன்|naan magizhchiyaaga irukkiraen","मैं खुश हूँ|main khush hūṁ","ഞാൻ സന്തോഷമാണ്|jñān santaṣamāṇṁ","Je suis heureux"],
 ["ph24","emotions","p","I am sad","நான் வருத்தமாக இருக்கிறேன்|naan varuththamaaga irukkiraen","मैं उदास हूँ|main udās hūṁ","എനിക്ക് വിഷമമാണ്|enikku viṣamāṇṁ","Je suis triste"],
 ["ph25","emotions","p","I love you","எனக்கு நீங்கள் பிடிக்கிறீர்கள்|enakku neenga pidikkiraergu","मैं तुमसे प्यार करता हूँ|main tumse pyār kartā hūṁ","ഞാൻ നിന്നെ പ്രേമിക്കുന്നു|jñān ninne prēmikkuṇu","Je t'aime"],
 ["ph26","emergency","p","Please help me","என்னை உதவுங்கள்|ennai udhvangal","कृपया मेरी मदद करें|kṛpayā merī madad kareṁ","ദയവായി എനിക്കു സഹായിക്കുക|dhayavāyī enikku sahāyikkuka","Aidez-moi, s'il vous plaît"],
 ["ph27","emergency","p","Please call a doctor","ஒரு மருத்துவரை அழைக்கவும்|oru maruththavari azhaikkavum","एक डॉक्टर को बुलाइए|ek doktar ko bulāīe","ഒരു ഡോക്ടറെ വിളിക്കുക|oru ḍokṭare viḷikka","Appelez un médecin, s'il vous plaît"],
 ["ph28","emergency","p","Where is the hospital?","மருத்தவமநாஐ் engae?|maruththavanai engae?","अस्पताल कहाँ है?|aspatal kahaan hai?","ഹോസ്പിറ്റൽ എവിടെ?|hoṣpitṭal evide?","Où est l'hôpital ?"],
 ["ph29","people","p","Do you speak Tamil?","நீங்கள் தமிழ் பேசுகிறீர்களா?|neengal tamil pesugiraergala?","क्या आप तमिल बोलते हैं?|kya aap tamiḷ bolte haiṁ?","നിങ്ങൾ തമിഴ് പരയുന്നുണ്ടോ?|niṅgḷṛ tamiẟṟ paṟayunnuṇḍō?","Parlez-vous tamoul ?"],
 ["ph30","people","p","I am learning Tamil","நான் தமிழ் கற்றுக்கொள்கிறேன்|naan tamil karthukkolaigiraen","मैं तमिल सीख रहा हूँ|main tamiḷ sīkh rahā hūṁ","ഞാൻ തമിഴ് പഠിക്കുന്നു|jñān tamiẟṟ paṭhikkuṇu","J'apprends le tamoul"],
 ["ph31","people","p","Please speak slowly","மெதுவாக பேசுங்கள்|medhuvaaga pesunga","धीरे बोलें|dhīre boleṁ","മന്തമായി പറയൂ|manta māyī paṟayū","Parlez lentement, s'il vous plaît"],
 ["ph32","people","p","Please say it again","மீண்டும் சொல்லுங்கள்|miyndrum sollunga","दोबारा कहिए|dobārā kahīe","വീണ്ടും പറയൂ|vīṇḍum paṟayū","Pouvez-vous répéter ?"],
 ["ph33","people","p","I don't understand","நான் புரியவில்லை|naan puriville","मुझे समझ नहीं आया|mujhe samajh nahīṁ āyā","എനിക്ക് മനസ്സിലായില്ല|enikku manaṣṣilāyillā","Je ne comprends pas"],
 ["ph34","family","p","I have two children","எனக்கு இரண்டு குழந்தைகள் உள்ளன|enakku irundu kuzhandhaigal allaana","मेरे दो बच्चे हैं|mere do baccche haiṁ","എനിക്ക് രണ്ടു കുട്ടികളുണ്ട്|enikku raṇṭu kuṭṭikaḷuṇṭṭ","J'ai deux enfants"],
 ["ph35","greetings","p","See you tomorrow","நாளை காணுோம்|naalai kaṇoom","कल मिलेंगे|kal milēṅge","നാളെ കാണാം|nāle kāṇām","À demain"],
];

function parse1(s){ const i=s.indexOf("|"); return i<0?{t:s}:{t:s.slice(0,i),tr:s.slice(i+1)}; }
const DICT = RAW.map(r=>({id:r[0],cat:r[1],type:r[2],langs:{en:parse1(r[3]),ta:parse1(r[4]),hi:parse1(r[5]),ml:parse1(r[6]),fr:parse1(r[7])}}));
const BYID = {}; DICT.forEach(d=>BYID[d.id]=d);
const WORDS_ALL = DICT.filter(d=>d.type==="w");
const PHR_ALL = DICT.filter(d=>d.type==="p");
const WORDMAPS={}, PHRASEMAPS={};
LCODES.forEach(L=>{
  WORDMAPS[L]=new Map(); PHRASEMAPS[L]=new Map();
  WORDS_ALL.forEach(e=>WORDMAPS[L].set(norm(e.langs[L].t),e));
  PHR_ALL.forEach(e=>PHRASEMAPS[L].set(norm(e.langs[L].t),e));
});
const CATS = [
 {id:"greetings", en:"Greetings", icon:"👋"},
 {id:"people",    en:"People & Self", icon:"🙋"},
 {id:"food",      en:"Food & Dining", icon:"🍛"},
 {id:"travel",    en:"Travel", icon:"🚌"},
 {id:"shopping",  en:"Shopping", icon:"🛍️"},
 {id:"time",      en:"Time & Date", icon:"⏰"},
 {id:"weather",   en:"Weather", icon:"🌦️"},
 {id:"numbers",   en:"Numbers", icon:"🔢"},
 {id:"emotions",  en:"Feelings", icon:"💛"},
 {id:"family",    en:"Family", icon:"👪"},
 {id:"colors",    en:"Colors", icon:"🎨"},
 {id:"body",      en:"Body", icon:"🧍"},
 {id:"emergency", en:"Emergency", icon:"🚨"},
];

/* ---------------- helpers ---------------- */
function norm(s){ return String(s||"").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim(); }
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function T(e,L){ const l=e.langs[L]; return l?l.t:""; }
function TR(e,L){ const l=e.langs[L]; return (l&&l.tr)||""; }
function display(e,L){ return T(e,L)+(TR(e,L)?" ("+TR(e,L)+")":""); }
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function lev(a,b){
  const m=a.length,n=b.length;
  if(!m) return n; if(!n) return m;
  let prev=new Array(n+1); for(let j=0;j<=n;j++) prev[j]=j;
  for(let i=1;i<=m;i++){
    let cur=[i];
    for(let j=1;j<=n;j++){
      const cost=a[i-1]===b[j-1]?0:1;
      cur[j]=Math.min(prev[j]+1, cur[j-1]+1, prev[j-1]+cost);
    }
    prev=cur;
  }
  return prev[n];
}

/* ---------------- OFFLINE CHAT BRAIN (all 5 languages) ---------------- */
const INTENTS = [
 { id:"greeting", teach:"ph1",
   pat:{ en:/\b(hi|hello|hey|yo|good (morning|afternoon|evening|day))\b/i,
         ta:/வாண்க்க|வாண்க்கம்|காலை வாண்க்க|நல்ல காலை|நல்ல மாலை|ஹலோ|ஹெலோ|ஹலலோ/,
         hi:/नमस्ते|नमस्कार|हेलो|हाय|हैलो|सुप्रभात|शुभ/,
         ml:/നമസ്കാരം|ഹായ്|ഹെലോ|ഹായ/,
         fr:/\b(bonjour|bonsoir|salut|coucou|hello|hi|yo)\b/i },
   resp:{ en:"Hello! Vanakkam! Namaste! 🙏 I am your language partner. How are you today?",
          ta:"வாண்க்கம்! Namaste! நான உங்க்ள மெழித் துணை. நிங்க்ள எ்பபடி இருக்கிறிஈர்கள்?",
          hi:"नमस्ते! वणक्कम! 🙏 मैं आपका भाषा-साथी हूँ। आज आप कैसे हैं?",
          ml:"നമസ്കാരം! വണക്ക്കം! 🙏 ഞാൻ നിങ്ങളുടെ ഭാഷാ സഹായി. ഇന്ന് നിങ്ങൾ എങ്ങനെ?",
          fr:"Bonjour ! Vanakkam ! 🙏 Je suis votre partenaire de langue. Comment allez-vous aujourd'hui ?" },
 },
 { id:"howare", teach:"ph2",
   pat:{ en:/\b(how are you|how's it going|how is it going|whats up|what's up|how do you do|hows it going)\b/i,
         ta:/எப்படியு|எப்போ|நலமா|நல்லதா/,
         hi:/कैस|कसे/,
         ml:/എങ്ങനെ|ഭാല്യ/,
         fr:/comment allez-vous|comment vas-tu|ça va|ca va|comment ça va|quoi de neuf|tu vas bien/i },
   resp:{ en:"I am doing great, thank you for asking! How about you?",
          ta:"நான் மிக நல்லதாயு இருக்கிறேன், கேட்டதற்கு நன்றி! நீங்கள் எப்படியு?",
          hi:"मैं बहुत अच्छा हूँ, पूछने के लिए धन्यवाद! आप कैसे हैं?",
          ml:"ഞാൻ വളരെ നല്ലതാണ്, ചോദിച്ചതിന് നന്ദി! നിങ്ങൾ എങ്ങനെ?",
          fr:"Je vais très bien, merci de demander ! Et vous, comment allez-vous ?" },
 },
 { id:"name", teach:"ph3",
   pat:{ en:/\b(my name is|call me|i am called)\b/i,
         ta:/என் பெயரு|என்னை \w+ என்று அழை/,
         hi:/मेरा नाम|मेरे नाम|अपना नाम/,
         ml:/എന്റെ പേര്/,
         fr:/je m'appelle|mon nom est|m'appelle/i },
   resp:{ en:"Nice to meet you, {NAME}! 🙌 What would you like to practice today?",
          ta:"{NAME}! உங்களை சந்தித்ததில் மகிழ்ச்சி! 🙌 இன்று என்ன பயிற்சியு செய்வது?",
          hi:"{NAME}! आपसे मिलकर खुशी हुई! 🙌 आज आप क्या अभ्यास करना चाहेंगे?",
          ml:"{NAME}! നിങ്ങളെ കണ്ടതോടെ സന്തോഷം! 🙌 ഇന്ന് എന്ത് പരിശീലിക്കാം?",
          fr:"Enchanté de vous rencontrer, {NAME} ! 🙌 Que voulez-vous pratiquer aujourd'hui ?" },
 },
 { id:"thanks", teach:"g5",
   pat:{ en:/\b(thanks|thank you|thx|appreciate)\b/i,
         ta:/நன்றி|தயவுசெய்து நன்றி/,
         hi:/धन्यवाद|शुक्रिया|थैंक्स|थैंक/,
         ml:/നന്ദി/,
         fr:/\b(merci|remercie|remercient)\b/i },
   resp:{ en:"Anytime! I am always happy to help. 🌟",
          ta:"எப்போதும் உதவ மகிழ்ச்சி! 🌟 வேறு ஏதாவது?",
          hi:"हमेशा आपकी मदद के लिए तैयार! 🌟 और कुछ?",
          ml:"സഹായിക്കാൻ എപ്പോഴും സന്തോഷം! 🌟 മറ്റെന്തെങ്കിലും?",
          fr:"Avec plaisir ! Je suis toujours ravi de vous aider. 🌟" },
 },
 { id:"sorry", teach:"g7",
   pat:{ en:/\b(sorry|excuse me|apologize|apologies|my bad)\b/i,
         ta:/മன்னിക്കவும்|சாரி|துணிக|தவறு/,
         hi:/माफ़|माफी|क्षमा|सॉरी|सॉरी/,
         ml:/ക്ഷമിക്കുക|ക്ഷമിക്കണം|സോറി/,
         fr:/désolé|desole|pardon|excusez|excuse-moi|navré/i },
   resp:{ en:"No problem at all! Mistakes are how we learn. Try again! 💪",
          ta:"ஒன்றும் இல்லை! தவற்தான் கற்கும் வழியு. மீண்டும் முயற்சிக்கவும்! 💪",
          hi:"कोई बात नहीं! गलतियाँ ही सीखने का रास्ता है। फिर कोशिश करें! 💪",
          ml:"ഒന്നും വേണ്ട! പിശക്കുകളാണ് പഠിക്കുന്ന വഴി. വീണ്ടും ശ്രമിക്കൂ! 💪",
          fr:"Pas de problème ! Les erreurs, c'est comme ça qu'on apprend. Retentez ! 💪" },
 },
 { id:"bye", teach:"ph35",
   pat:{ en:/\b(bye|goodbye|good bye|see you|good night|see you later|take care|talk to you soon|gn)\b/i,
         ta:/விடை|அ்பபோ/,
         hi:/अलविदा|बाय|फिर मिलेंगे|अगली|गुड नाइट/,
         ml:/വായ്|പിന്നെ കാണാം|നല്ല രാത്രി/,
         fr:/au revoir|adieu|à bientôt|a bientôt|bonne nuit|ciao/i },
   resp:{ en:"Goodbye! Great practice today. See you tomorrow! 👋",
          ta:"வணக்கம்! இன்று நல்ல பயிற்சியு. நாளை காணுோம்! 👋",
          hi:"अलविदा! आज का अभ्यास बढ़िया था। कल मिलेंगे! 👋",
          ml:"നമസ്കാരം! ഇന്ന് നല്ല പരിശീലനം. നാളെ കാണാം! 👋",
          fr:"Au revoir ! Super pratique aujourd'hui. À demain ! 👋" },
 },
 { id:"food", teach:"ph8",
   pat:{ en:/\b(hungry|thirsty|food|eat|eating|water|menu|bill|coffee|tea|rice|bread|curry|soup|spicy|milk|sweet|tasty|delicious|lunch|dinner|breakfast|vegetarian|biryani|dosa|idli|pancake|restaurant)\b/i,
         ta:/பசி|உணவு|சாப்பிட|தண்ணீர்|மெனு|பில்லை|பில்|காபி|காரி|தாளம்|சூபா|சோறு|ரொட்டி|பூரி|பால்|அடை|சுவை|காரம்|உப்பு|தாகம்|வெஜി|சாப்பாடு|மோர்|பழம்/,
         hi:/खाना|भूख|प्यास|पानी|बिल|मेन्यू|चाय|कॉफ़ी|मीठा|रोटी|चावल|दूध|सलाद|डिश|रेस्टोरेंट|शालान|खाना/,
         ml:/ഭക്ഷണം|വെള്ളം|തടി|ദാഹം|മെനു|ബിൽ|ചായ|കാപ്പി|അരി|അപ്പം|പാല്|പഞ്ചസാര|ഉപ്പ്|കായ്|പഴം|വീരം|രുചി/,
         fr:/\b(faim|soif|nourriture|manger|restaur|menu|addition|thé|café|riz|pain|fromage|lait|sucre|sel|dessert|délicieux|vegetarien)\b/i },
   resp:{ en:"Great topic! Let's talk about food. Try saying 'I am hungry' in your target language!",
          ta:"நல்ல விஷயம்! உணவு பற்றியு பேசுலாம். 'நான் பசிக்கிறேன்' சொல்லுங்கள்!",
          hi:"बढ़िया विषय! खाने पर बात करें। 'मुझे भूख लगी है' कहकर देखें!",
          ml:"നല്ല വിഷയം! ഭക്ഷണത്തെക്കുറിച്ച് പരിശീലിക്കാം. 'എനിക്ക് തടിയുണ്ട്' പറയൂ!",
          fr:"Super sujet ! Parlons de manger. Essayez de dire « J'ai faim » !" },
 },
 { id:"travel", teach:"ph14",
   pat:{ en:/\b(where|bus|train|flight|ticket|how far|direction|station|go|going|left|right|forward|back|here|there|car|bike|drive|arrive|reach|hotel|airport|road|street|parking)\b/i,
         ta:/எங்கே|பஸ்|ரயில்|விமானம்|டிக்கெட்|தூரம்|வழி|பாதை|நிலையம்|போக|செல்ல|இடது|வலது|முன்னே|பின்னே|இங்கு|அங்கு|வண்டி|சைக்கிள்/,
         hi:/कहाँ|कहां|बस|ट्रेन|टिकट|फ्लाइट|दूर|रास्ता|सड़क|होटल|एयरपोर्ट|गाड़ी|साइकिल|सामने|पीछे|बायें|दाहिनें/,
         ml:/എവിടെ|ബസു|ട്രെയിൻ|ടിക്കറ്റ്|വിമാനം|ദൂരം|വഴി|ഇടത്ത്|വലത്ത്|മുന്നോട്ട്|പിന്നോട്ട്|ഇവിടെ|അവിടെ|കാർ|ഹോട്ടൽ|ഏര്പോർട്ട്/,
         fr:/\b(où|bus|train|avion|billet|station|aéroport|hôtel|route|droite|gauche|avant|arrière|ici|là|loin|voiture|parking|allée)\b/i },
   resp:{ en:"Travel! Very useful: 'Where is the shop?' — try it in your target language!",
          ta:"பயணம்! மிகவும் பயனுள்ள வார்த்தை: 'கடையு எங்கே?' — சொல்லுங்கள்!",
          hi:"यात्रा! बहुत उपयोगी: 'दुकान कहाँ है?' — कहकर देखें!",
          ml:"യാത്ര! വളരെ ഉപയോഗപ്രദം: 'കട എവിടെ?' — പറയൂ!",
          fr:"Voyage ! Très utile : « Où est le magasin ? » — essayez !" },
 },
 { id:"shopping", teach:"ph18",
   pat:{ en:/\b(price|cost|how much|shop|store|buy|buying|money|cash|discount|quality|bag|sell|sale|expensive|cheap|market)\b/i,
         ta:/விலை|எவ்வளவு|கடை|வாங்க|பணம்|ரொக்கம்|மலிவு|தரம்|பை|விற்பனை|கொடுங்கள்/,
         hi:/कीमत|कितने|दुकान|खरीद|पैसा|नक़्दी|सस्ता|महंगा|बैग|खरीदारी|छूट/,
         ml:/വില|എത്ര|കട|വാങ്ങ|പണം|റക്കം|ബാഗ്|കിഴിവു|വിലയേറിയ/,
         fr:/\b(prix|combien|magasin|boutique|acheter|argent|espèces|cher|pas cher|sac|solde|réduction|marque)\b/i },
   resp:{ en:"Shopping! How do you ask the price? Say 'How much is this?' in your target language!",
          ta:"வர்த்தகம்! விலை எப்படி கேட்பானு? 'இது எவ்வளவு?' சொல்லுங்கள்!",
          hi:"खरीदारी! कीमत कैसे पूछें? 'यह कितने का है?' कहें!",
          ml:"വാങ്ങൽ! വില എങ്ങനെ ചോദിക്കാം? 'ഇത് എത്ര വില?' പറയൂ!",
          fr:"Achats ! Comment demander le prix ? Dites « C'est combien ? »" },
 },
 { id:"time", teach:"ph17",
   pat:{ en:/\b(time|today|tomorrow|yesterday|morning|noon|evening|night|week|month|year|day|clock|late|early|minute|hour|date|when)\b/i,
         ta:/மனி|நேரம்|இன்று|நாளை|நேற்று|காலை|மதியம்|மாலை|இரவு|வாரம்|மாதம்|ஆண்டு|தினம்|நிமிடம்|எப்போது/,
         hi:/समय|बजे|आज|कल|सुबह|शाम|रात|दिन|हफ़्ता|महीना|साल|घंटा|मिनट|कब|तारीख/,
         ml:/മണി|നേരം|ഇന്ന്|നാളെ|ഇന്നലെ|രാവിലെ|ഉച്ച|വൈകുന്നേരം|രാത്രി|ദിവസം|വാരം|മാസം|വർഷം|മിനിറ്റ്|എപ്പോൾ/,
         fr:/\b(heure|aujourd'hui|demain|hier|matin|midi|soir|nuit|semaine|mois|année|quand|date|jour|minute)\b/i },
   resp:{ en:"Time! Learn to ask the time in your target language — you will use it every day!",
          ta:"நேரம்! நேரம் கேட்க வார்த்தைகளு கற்றுக்கொள்ளுங்கள்!",
          hi:"समय! समय पूछने की बात सीखें!",
          ml:"നേരം! സമയം ചോദിക്കുന്നത് പഠിക്കാം!",
          fr:"Le temps ! Apprenez à demander l'heure — indispensable !" },
 },
 { id:"weather", teach:"ph21",
   pat:{ en:/\b(rain|rainy|sunny|sun|hot|cold|weather|wind|cloud|sky|humid|storm|temperature|degree|monsoon)\b/i,
         ta:/மழை|வெய்இல்|குளிர்|கார்து|மேகம்|வானம்|சஊடா|குளிர்்சி|மஊடு|வெப்பம்/,
         hi:/बारिश|सूरज|गर्मी|गर्म|ठंड|बादल|आसमान|हवा|मौसम|डिग्री/,
         ml:/മഴ|വെയിൽ|ചൂട്|തണുപ്പ്|മേഘം|ആകാശം|കാറ്റ്|കാലാവസ്ഥ/,
         fr:/\b(pluie|soleil|chaud|froid|nuage|ciel|vent|température|tempête|orage|météo|brume)\b/i },
   resp:{ en:"Weather talk! Say 'It is raining' in your target language!",
          ta:"வானிலை! 'இன்று மழையு பெய்கிறது' சொல்லுங்கள்!",
          hi:"मौसम! 'बारिश हो रही है' कहकर देखें!",
          ml:"കാലാവസ്ഥ! 'ഇപ്പോൾ മഴ പെയ്യുന്നു' പറയൂ!",
          fr:"La météo ! Dites « Il pleut » !" },
 },
 { id:"numbers", teach:"n5",
   pat:{ en:/\b(one|two|three|four|five|six|seven|eight|nine|ten|twenty|fifty|hundred|thousand|number|count|counting|digit)\b/i,
         ta:/ஒன்று|இரண்டு|மூன்று|நான்கு|ஐந்து|ஆறு|ஏழு|எட்டு|ஒன்பது|பத்து|இருபது|ஐம்பது|நூறு|ஆயிரம்|எண்|எண்ண/,
         hi:/एक|दो|तीन|चार|पाँच|छह|सात|आठ|नौ|दस|बीस|पचास|सौ|हज़ार|गिनती|संख्या/,
         ml:/ഒന്ന്|രണ്ട്|മൂന്ന്|നാല്|അഞ്ച്|ആറ്|ഏഴ്|എട്ട്|ഒൻപത്|പത്തു|ഇരുപത്|നൂറ്|ആയിരം|സംഖ്യ/,
         fr:/\b(un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|vingt|cent|mille|nombre|compter|chiffre)\b/i },
   resp:{ en:"Let's count! Follow me: One, Two, Three — in your target language!",
          ta:"எண்ணுங்கள்! One, Two, Three — உங்கள் மொழியில் சொல்லுங்கள்!",
          hi:"गिनती करें! One, Two, Three — अपनी भाषा में बोलें!",
          ml:"സംഖ്യകൾ! One, Two, Three — നിങ്ങളുടെ ഭാഷയിൽ പറയൂ!",
          fr:"Comptons ! One, Two, Three — dites-le dans votre langue !" },
 },
 { id:"family", teach:"ph34",
   pat:{ en:/\b(mother|mom|mum|father|dad|sister|brother|child|children|husband|wife|son|daughter|grandfather|grandmother|family|relative|uncle|aunt)\b/i,
         ta:/அம்மா|அப்பா|சகோதரி|சகோதரனு|குழந்தையு|கணவனு|மனைவியு|மகனு|மகளு|தாத்தா|பாட்டி|குடும்பம்|உறவு/,
         hi:/माँ|पिता|बहन|भाई|बच्चा|बच्च|पत्नी|पति|बेटा|बेटी|दादी|दादा|परिवार|चाचा|चाची/,
         ml:/അമ്മ|അച്ഛൻ|സഹോദരി|സഹോദരൻ|കുട്ടി|ഭാര്യ|പതി|മകൻ|മകൾ|അമ്മാമ്മ|താതാ|കുടുംബം/,
         fr:/\b(mère|père|sœur|frère|enfant|femme|mari|fils|fille|grand-mère|grand-père|famille|tonton|tante)\b/i },
   resp:{ en:"Family! Say 'I have two children' in your target language!",
          ta:"குடும்பம்! 'எனக்கு இரண்டு குழந்தையு உண்டு' சொல்லுங்கள்!",
          hi:"परिवार! 'मेरे दो बच्चे हैं' कहकर देखें!",
          ml:"കുടുംബം! 'എനിക്ക് രണ്ടു കുട്ടികളുണ്ട്' പറയൂ!",
          fr:"Famille ! Dites « J'ai deux enfants » !" },
 },
 { id:"colors", teach:"c1",
   pat:{ en:/\b(red|green|blue|yellow|white|black|color|colour|orange|pink|purple|grey|gray|brown)\b/i,
         ta:/சிவ்ப்பு|ப்ச்சை|நில்ம்|மஞ்ச்ள்|வெளளையு|கரு்ப்பு|வண்ண்ம்/,
         hi:/लाल|हरा|नीला|पीला|सफ़ेद|काला|रंग|गुलाबी|बैंगनी|भूरा/,
         ml:/ചുവപ്പ്|പച്ച|നീല|മഞ്ഞ|വെളുപ്പ്|കറുപ്പ്|നിറം/,
         fr:/\b(rouge|vert|bleu|jaune|blanc|noir|couleur|rose|violet|marron|orange)\b/i },
   resp:{ en:"Colors! Red, Green, Blue — say them in your target language! What is your favorite?",
          ta:"வண்ணங்கள்! Red, Green, Blue — உங்கள் மொழியில் சொல்லுங்கள்! விரும்பும் வண்ணம் என்ன?",
          hi:"रंग! Red, Green, Blue — अपनी भाषा में बोलें! आपका पसंदीदा रंग कौन सा है?",
          ml:"നിറങ്ങൾ! Red, Green, Blue — നിങ്ങളുടെ ഭാഷയിൽ പറയൂ! നിങ്ങൾക്ക് ഇഷ്ടപ്പെട്ട നിറം ഏതാണ്?",
          fr:"Les couleurs ! Red, Green, Blue — dites-les dans votre langue ! Quelle est votre couleur préférée ?" },
 },
 { id:"help", teach:"ph32",
   pat:{ en:/\b(help|help me|not understand|don't understand|dont understand|say again|repeat|speak slowly|slowly|explain|teach|teaching|practice|mistake|correct|right|wrong|confused|what is this|how do i say|how do you say)\b/i,
         ta:/புரியவில்லை|புரியாது|உதவி|உதவு|மீண்டு|மெதுவாக|க்ர்து|கற்பி|விளக்கு|விளக்கம்|தவ்ரு|சரியா/,
         hi:/मदद|समझ नहीं|दोबारा|धीरे|समझाओ|सीख/,
         ml:/സഹായം|മനസ്സിലായില്ല|വീണ്ടും|മന്തമായി|വിശദീകരിക്കുക|പഠി/,
         fr:/\b(aide|comprends|répéter|lentement|expliquer|apprends|exercice|faute|correction|difficile|confus)\b/i },
   resp:{ en:"I am here to help! If you do not understand, say 'Please say it again' — and try the Translate tab for any sentence!",
          ta:"நான் உதவக்காக இருக்கிறேன்! புரியவில்லையெனில் 'மீண்டும் சொல்லுங்கள்' சொல்லுங்கள் — Translate முகத்தையும் முயற்சிக்கவும்!",
          hi:"मैं मदद के लिए यहाँ हूँ! समझ न आया तो 'दोबारा कहिए' बोलें — और Translate टैब भी आजमाएँ!",
          ml:"ഞാൻ സഹായിക്കാൻ ഇവിടെയുണ്ട്! മനസ്സിലായില്ലെങ്കിൽ 'വീണ്ടും പറയൂ' പറയൂ — Translate ടാബും പരീക്ഷിക്കൂ!",
          fr:"Je suis là pour vous aider ! Si vous ne comprenez pas, dites « Pouvez-vous répéter ? » — et essayez l'onglet Traduire !" },
 },
 { id:"language", teach:"ph30",
   pat:{ en:/\b(tamil|english|hindi|malayalam|french|language|speak|speaking|learn|learning|study|translate|translation|word|vocabulary|pronunciation|fluency)\b/i,
         ta:/தமிழ்|ஆங்கில்ம்|हिन्दी|മലൾറසം|Français|மெழி|மெயிற்சி|கற்க|பேசு|படி/,
         hi:/तमिल|हिंदी|अंग्रेज़ी|मलयालम|फ़्रेंच|भाषा|बोलना|बोलते|सीखना|अनुवाद|शब्द|उच्चारण|शब्दकोश/,
         ml:/തമിഴ്|മലയാളം|ഇംഗ്ലീഷ്|ഹിന്ദി|ഫ്രഞ്ച്|ഭാഷ|പറയ|പഠി|വിവർത്തനം|ശബ്ദം|ഉച്ചാരണം/,
         fr:/\b(tamoul|tamil|hindi|malayalam|français|anglais|langue|parler|apprendre|traduire|mot|vocabulaire|prononciation)\b/i },
   resp:{ en:"I can help in Tamil, English, Hindi, Malayalam and French! What do you want to learn today? Try a topic: food, travel, shopping, time, weather…",
          ta:"நான் தமிழ், English, हिन्दी, മലയാളം, Français-ல் உதவ முடியும்! இன்று என்ன கற்க விரும்புகிறீர்கள்?",
          hi:"मैं तमिल, English, हिन्दी, मलयालम और Français में मदद कर सकता हूँ! आज आप क्या सीखना चाहेंगे?",
          ml:"ഞാൻ தமிழ், English, हिन्दी, മലയാളം, Français-ൽ സഹായിക്കാൻ കഴിയും! ഇന്ന് എന്ത് പഠിക്കാം?",
          fr:"Je peux aider en tamoul, English, हिन्दी, മലയാളം et Français ! Que voulez-vous apprendre aujourd'hui ?" },
 },
];
const DEFAULT_INTENT = {
  en:"I didn't quite catch that! 😅 Let's pick a topic — food, travel, shopping, time, weather, numbers, family, colors — or say 'help'! (Tip: enable the AI tutor in ⚙️ for open-ended chat.)",
  ta:"கேட்பதில்லை! 😅 ஒரு முகத்தை தேர்வுசெய்யுங்கள்: உணவு, பயணம், கடை, நேரம், வானிலை, எண்கள், குடும்பம், வண்ணம் — அல்லது 'உதவியு' சொல்லுங்கள்! (⚙️-ல் AI tutor-ஐ இயக்கினால் எதுவும் பேசலாம்.)",
  hi:"मुझे ठीक से नहीं समझा! 😅 एक विषय चुनें — खाना, यात्रा, खरीदारी, समय, मौसम, गिनती, परिवार, रंग — या 'मदद' बोलें! (⚙️ में AI tutor चालू करें तो कुछ भी बात कर सकते हैं।)",
  ml:"സംഗീതമായില്ല! 😅 ഒരു വിഷയം തിരഞ്ഞെടുക്കൂ — ഭക്ഷണം, യാത്ര, വാങ്ങൽ, നേരം, കാലാവസ്ഥ, സംഖ്യകൾ, കുടുംബം, നിറങ്ങൾ — അല്ലെങ്കിൽ 'സഹായം' പറയൂ! (⚙️-ൽ AI tutor ഓൺ ചെയ്താൽ എന്തും സംസാരിക്കാം.)",
  fr:"Je n'ai pas bien compris ! 😅 Choisissez un sujet — manger, voyage, achats, heure, météo, nombres, famille, couleurs — ou dites « aide » ! (Activez le tuteur IA dans ⚙️ pour discuter librement.)",
};
const NAME_PAT = {
  en:/my name is\s+([a-zA-Zà-ÿ']{2,15})/i,
  fr:/je m'appelle\s+([A-Za-zÀ-ÿ]{2,15})/i,
  ta:/என் பெயரு\s+(\S+)/,
  hi:/मेरा नाम\s+(\S+)/,
  ml:/എന്റെ പേര്\s+(\S+)/,
};
const QUICK_IDS = ["ph8","ph14","ph18","ph17","ph21","ph30"];

/* ---------------- STATE ---------------- */
const SKEY="talkora_v2";
const SKEY_OLD="vazhakam_v2";
function migrateOldKey(){ try{
  if(!localStorage.getItem(SKEY) && localStorage.getItem(SKEY_OLD)){
    localStorage.setItem(SKEY, localStorage.getItem(SKEY_OLD));
    localStorage.removeItem(SKEY_OLD);
  }
}catch(e){} }
migrateOldKey();
function todayStr(){ const d=new Date(); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); }
function loadS(){ try{ return JSON.parse(localStorage.getItem(SKEY)||"{}"); }catch(e){ return {}; } }
function sDefaults(){
  return {
    speak:"ta", learn:"en",
    xp:0, streak:1, lastDate:todayStr(),
    known:{}, unknown:{}, chatCount:0, perfect:0,
    name:null, recents:[],
    goal:100, today:{date:todayStr(),xp:0},
    sound:true, dark:false, rate:1.0, slow:false,
    ai:{on:false,provider:"pollinations",model:"",key:""},
    /* v3 */
    favs:{}, mistakes:{}, srs:{}, badges:{},
    bestQuiz:0, aiChats:0, convOn:false, aiLevel:"b2",
  };
}
const S = Object.assign(sDefaults(), loadS());
function save(){ try{ localStorage.setItem(SKEY,JSON.stringify(S)); }catch(e){} }

const LEVELS=[
 {min:0,en:"Beginner",ta:"தொடக்கம்"},
 {min:50,en:"Explorer",ta:"ஆய்வாளர்"},
 {min:150,en:"Speaker",ta:"பேச்சாளர்"},
 {min:300,en:"Conversationalist",ta:"உரையாடல்"},
 {min:500,en:"Storyteller",ta:"கதைசொல்லி"},
 {min:800,en:"Fluent",ta:"பரிச்சயம்"},
 {min:1200,en:"Master",ta:"மேதை"},
];
function levelOf(xp){ let i=0; for(let k=0;k<LEVELS.length;k++) if(xp>=LEVELS[k].min) i=k; return i; }
function nextLevel(xp){ const i=levelOf(xp); return i<LEVELS.length-1?LEVELS[i+1].min:null; }

let toastTimer=null;
function toast(html,ms=2800){
  const t=document.getElementById("toast");
  t.innerHTML=html; t.classList.add("on");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove("on"),ms);
}
function touchStreak(){
  const t=todayStr();
  if(S.lastDate!==t){
    const y=new Date(); y.setDate(y.getDate()-1);
    const ys=y.getFullYear()+"-"+(y.getMonth()+1)+"-"+y.getDate();
    S.streak=(S.lastDate===ys)?S.streak+1:1;
    S.lastDate=t;
  }
  if(S.today.date!==t) S.today={date:t,xp:0};
}
function addXp(n,label){
  touchStreak();
  S.xp+=n;
  S.lastPractice=new Date().toISOString().slice(0,10);
  const before=levelOf(S.xp-n), after=levelOf(S.xp);
  if(n>0) S.today.xp+=n;
  save(); renderXp();
  if(after>before){ toast("🎉 <span class='lv'>Level up!</span> You are now a <b>"+LEVELS[after].en+"</b>",4000); beep("level"); confetti(); }
  else if(label) toast("+"+n+" XP · "+label);
  if(n>0 && S.today.xp>=S.goal && S.today.goalDone!==true){
    S.today.goalDone=true; save();
    toast("🎯 Daily goal reached! ("+S.today.xp+"/"+S.goal+" XP) Amazing work!",4500); beep("level"); confetti();
  }
  checkBadges();
}

/* ---------------- SOUND ---------------- */
let AC=null;
function beep(kind){
  if(!S.sound) return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    const notes = kind==="good"?[660,880]:kind==="bad"?[220,175]:kind==="level"?[523,659,784,1046]:[440];
    notes.forEach((f,i)=>{
      const o=AC.createOscillator(), g=AC.createGain();
      o.type="sine"; o.frequency.value=f;
      const t0=AC.currentTime+i*0.09;
      g.gain.setValueAtTime(0.0001,t0);
      g.gain.exponentialRampToValueAtTime(0.16,t0+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,t0+0.12);
      o.connect(g); g.connect(AC.destination);
      o.start(t0); o.stop(t0+0.14);
    });
  }catch(e){}
}

/* ---------------- TTS ---------------- */
let VOICES=[];
function loadVoices(){ VOICES=(window.speechSynthesis||{}).getVoices()||[]; }
if("speechSynthesis" in window){ loadVoices(); window.speechSynthesis.onvoiceschanged=loadVoices; }
function speak(text,lang,rate,cb){
  if(!("speechSynthesis" in window)||!text){ if(cb) cb(); return; }
  try{
    const u=new SpeechSynthesisUtterance(text);
    let v=null;
    const pats=LANGS[lang]?LANGS[lang].voices:[/^en/i];
    for(const r of pats){ v=VOICES.find(x=>r.test(x.lang)); if(v) break; }
    if(v) u.voice=v;
    u.lang=(LANGS[lang]||LANGS.en).tts;
    u.rate=rate||(S.slow?0.55:S.rate);
    window.speechSynthesis.cancel();
    document.body.classList.add("talking");
    const __done=()=>{ document.body.classList.remove("talking"); if(cb) cb(); };
    u.onend=__done; u.onerror=__done;
    window.speechSynthesis.speak(u);
  }catch(e){}
}

/* ---------------- STT ---------------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let rec=null, recBusy=false;
function newRec(lang,onRes,onEnd){
  if(!SR) return null;
  const r=new SR();
  r.lang=LANGS[lang].stt;
  r.interimResults=true; r.continuous=false; r.maxAlternatives=1;
  r.onresult=(e)=>{
    let interim="",final="";
    for(let i=e.resultIndex;i<e.results.length;i++){
      const t=e.results[i][0].transcript;
      if(e.results[i].isFinal) final+=t; else interim+=t;
    }
    if(interim&&onRes.interim) onRes.interim(interim);
    if(final&&onRes.text) onRes.text(final.trim());
  };
  r.onend=()=>{ recBusy=false; setMic(false); if(onEnd) onEnd(); };
  r.onerror=(e)=>{
    recBusy=false; setMic(false);
    if(e.error==="not-allowed"||e.error==="service-not-allowed") showMicBanner("🎤 Microphone permission was denied. Allow mic access, or type instead.");
    else if(e.error==="no-speech") showMicBanner("🎤 I didn't hear anything — tap the mic and speak clearly.");
    else showMicBanner("🎤 Mic problem ("+e.error+"). Try Chrome/Edge in a normal tab, or type instead.");
  };
  return r;
}
function setMic(on){
  document.getElementById("micbtn").classList.toggle("rec",on);
  document.getElementById("tmscbtn").classList.toggle("rec",on);
  document.getElementById("pmicbtn").innerHTML=on?"🎧 Listening…":"🎤 Say it now";
}
function showMicBanner(msg){ const b=document.getElementById("micbanner"); b.textContent=msg; b.classList.add("on"); }
function initMicBanner(){
  const b=document.getElementById("micbanner");
  if(!SR){ b.innerHTML="⚠️ <b>Voice input</b> isn't supported in this browser — type instead. Voice works great in <b>Chrome</b> / <b>Edge</b>."; b.classList.add("on"); return; }
  if(location.protocol==="file:"){ b.innerHTML="ℹ️ Opened as a file — for voice + online translation + AI tutor, run <b>node server.js</b> and open http://localhost:3000"; b.classList.add("on"); }
}

/* ---------------- CHAT ---------------- */
const chatlog=document.getElementById("chatlog");
let lastBotText="", lastBotLang=null;
let CHAT_HIST=[];

function addMsg(role,main,sub,teach,teachLang){
  const div=document.createElement("div");
  div.className="msg "+role;
  const who=document.createElement("div");
  who.className="who"; who.textContent=role==="bot"?"Talkora 🤖":"You · "+LANGS[S.speak].name;
  div.appendChild(who);
  const bub=document.createElement("div"); bub.className="bub"; bub.textContent=main;
  div.appendChild(bub);
  if(sub){ const s=document.createElement("div"); s.className="sub"; s.textContent=sub; div.appendChild(s); }
  if(teach){
    const t=document.createElement("div"); t.className="teach";
    t.innerHTML="<div class='lbl'>✨ Learn this</div>";
    const row=document.createElement("div"); row.className="row";
    const grow=document.createElement("div"); grow.className="grow"; grow.textContent=teach;
    const ab=document.createElement("button"); ab.className="mini"; ab.textContent="🔊"; ab.title="Listen";
    const seg=teach.split(/\s*[—(]/)[0].trim();
    ab.onclick=()=>speak(seg,teachLang||S.learn);
    row.appendChild(grow); row.appendChild(ab);
    t.appendChild(row);
    div.appendChild(t);
  }
  if(role==="bot"){
    const a=document.createElement("div"); a.className="actions";
    const ab=document.createElement("button"); ab.className="mini"; ab.textContent="🔊 Listen";
    ab.onclick=()=>speak(main,teachLang||lastBotLang||S.learn);
    const ab2=document.createElement("button"); ab2.className="mini"; ab2.textContent="🐢 Slow";
    ab2.onclick=()=>speak(main,teachLang||lastBotLang||S.learn,0.5);
    a.appendChild(ab); a.appendChild(ab2);
    div.appendChild(a);
  }
  chatlog.appendChild(div);
  chatlog.scrollTop=chatlog.scrollHeight;
  return div;
}

function renderTeach(teachId){
  const e=BYID[teachId]; if(!e) return null;
  return T(e,S.learn)+(TR(e,S.learn)?" ("+TR(e,S.learn)+")":"")+" — "+T(e,S.speak);
}
function botGreet(){
  const r={
    ta:"வாண்க்கம்! Namaste! नमस्कारं! Bonjour! 🙏 நான உங்க்ள மெழித் துணை. 'வாண்க்கம்' என்ரு சோல்ல முடிகிறதா?",
    hi:"नमस्ते! वणक्कम! नमस्कारं! Bonjour! 🙏 मैं आपका भाषा-तुनै हूँ। क्या आप 'नमस्ते!' बोलेंगे?",
    en:"Hello! Vanakkam! Namaste! 🙏 I am your language partner. Can you say Hello in my language?",
    ml:"നമസ്കാരം! വണക്ക്കം! नमस्ते! Bonjour! 🙏 ഞാൻ നിങ്ങളുടെ ഭാഷാ സഹായി. 'നമസ്കാരം' എന്ന് പറയാമോ?",
    fr:"Bonjour ! Vanakkam ! नमस्ते ! നമസ്കാരം ! 🙏 Je suis votre partenaire de langue. Pouvez-vous dire Bonjour dans ma langue ?",
  };
  const sub={
    ta:"Hello! I am your language partner. Say 'Hello' in Tamil!",
    hi:"Hello! I am your language partner. Say 'Hello' in Hindi!",
    en:"Hello! I am your language partner. Say 'Hello' in English (or ask me anything below).",
    ml:"Hello! I am your language partner. Say 'Hello' in Malayalam!",
    fr:"Hello! I am your language partner. Say 'Hello' in French!",
  };
  lastBotText=r[S.learn]; lastBotLang=S.learn;
  addMsg("bot",lastBotText,sub[S.learn],renderTeach("g1"),S.learn);
  speak(T(BYID.g1,S.learn),S.learn);
}

function findIntent(text){
  const L=S.speak;
  for(const it of INTENTS){ if(it.pat[L]&&it.pat[L].test(text)) return it; }
  for(const L2 of LCODES){ if(L2===L) continue; for(const it of INTENTS){ if(it.pat[L2]&&it.pat[L2].test(text)) return it; } }
  return null;
}

async function aiReply(userText,convMode,sceneSysOverride){
  const X=LANGS[S.speak], Y=LANGS[S.learn];
  const lvlDesc={
    b1:"Beginner (A1-A2): use very short, simple sentences of 3-7 words, basic vocabulary only, one idea per message, be extra encouraging.",
    b2:"Intermediate (B1): short natural everyday sentences, common vocabulary, gentle small talk.",
    c1:"Advanced (B2-C1): full natural conversation, idiomatic language, a touch of humor."
  }[S.aiLevel||"b2"];
  let sys;
  if(sceneSysOverride){ sys=sceneSysOverride; }
  else if(convMode){
    sys=[
      "You are \"Talkora\", a warm, friendly conversation partner.",
      "The user speaks "+X.name+". They are practicing "+Y.name+". Level: "+lvlDesc,
      "Reply with ONLY valid JSON (no markdown, no code fences) in this exact shape:",
      '{"main":"...","sub":"...","teach":"..."}',
      "- \"main\": your next conversational turn in "+Y.name+" ONLY, 1-3 short natural sentences. Keep the chat flowing with a short question.",
      "- \"sub\": the translation of \"main\" into "+X.name+". If the user's last message contained a clear language mistake, append one brief correction in "+X.name+" like: Correction: ...",
      "- \"teach\": one useful phrase the user could try saying next, formatted EXACTLY as: <phrase in "+Y.name+"> (<transliteration>) — <meaning in "+X.name+">",
      "Keep the whole JSON under 220 words. Be friendly and consistent.",
    ].join("\n");
  } else {
  sys=[
    "You are \"Talkora\", a warm, patient, encouraging language tutor bot.",
    "The user speaks "+X.name+". You are helping them learn "+Y.name+". Level: "+lvlDesc,
    "Reply with ONLY valid JSON (no markdown, no code fences) in this exact shape:",
    '{"main":"...","sub":"...","teach":"..."}',
    "- \"main\": your reply in "+Y.name+" ONLY, 1-2 short natural sentences. Always ask one short follow-up question to keep the chat going. Use the user's name ("+(S.name||"unknown")+") if known; if unknown you may ask for it once.",
    "- \"sub\": the translation of \"main\" into "+X.name+", one sentence. If the user made an obvious language mistake, mention the correction briefly here in "+X.name+".",
    "- \"teach\": one new useful phrase, formatted EXACTLY as: <phrase in "+Y.name+"> (<transliteration of the phrase>) — <meaning in "+X.name+">",
    "Keep the whole JSON under 220 words. Be friendly and consistent.",
  ].join("\n");
  }
  const msgs=[{role:"system",content:sys}];
  CHAT_HIST.slice(-8).forEach(m=>msgs.push(m));
  msgs.push({role:"user",content:userText});
  const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({provider:S.ai.provider,key:S.ai.key,model:S.ai.model,messages:msgs,max_tokens:700})});
  const j=await r.json();
  if(!j.ok) throw new Error(j.error||"AI request failed");
  let s=String(j.text).trim().replace(/^```(?:json)?/,"").replace(/```$/,"").trim();
  const a=s.indexOf("{"), b=s.lastIndexOf("}");
  if(a>=0&&b>a) s=s.slice(a,b+1);
  const o=JSON.parse(s);
  return { main:String(o.main||s), sub:o.sub?String(o.sub):null, teach:o.teach?String(o.teach):null, done:!!o.done, score:o.score, feedback:o.feedback };
}

function botRespond(userText){
  // offline brain
  S.chatCount++; save();
  addMsg("user",userText,null,null,null);
  const np=userText;
  const nm=NAME_PAT[S.speak];
  if(nm){ const m=np.match(nm); if(m&&m[1]) S.name=m[1].replace(/^\d+/,""); }
  const intent=findIntent(np);
  let main,sub,teach=null,teachLang=S.learn;
  if(intent){
    main=intent.resp[S.learn];
    sub=intent.resp[S.speak];
    if(intent.id==="name"&&S.name) main=main.replace(/\{NAME\}/g,S.name);
    else main=main.replace(/\{NAME\}/g,"friend");
    teach=renderTeach(intent.teach);
  } else {
    main=DEFAULT_INTENT[S.learn];
    sub=DEFAULT_INTENT[S.speak];
  }
  lastBotText=main; lastBotLang=S.learn;
  setTimeout(()=>{
    addMsg("bot",main,sub,teach,teachLang);
    speak(main,S.learn);
    addXp(5,"chatting");
  },250);
}

async function handleUserText(raw){
  const text=String(raw||"").trim();
  if(!text) return;
  if(aiReady()){
    addMsg("user",text,null,null,null);
    S.chatCount++; save();
    const _im=document.getElementById("interim");
    _im.textContent="🤖 Thinking…"+(S.ai.provider==="pollinations"?" (free AI can take ~30 s)":"");
    try{
      const a=await aiReply(text,S.convOn,S.scene?sceneSys():null);
      if(S.scene){ S.scene.turns++; if(a.done) finishScene(a); }
      lastBotText=a.main; lastBotLang=S.learn;
      S.aiChats=(S.aiChats||0)+1;
      CHAT_HIST.push({role:"user",content:text});
      CHAT_HIST.push({role:"assistant",content:a.main});
      CHAT_HIST=CHAT_HIST.slice(-16);
      addMsg("bot",a.main,a.sub,a.teach,S.learn);
      speak(a.main,S.learn);
      addXp(5,S.convOn?"conversation":"AI chat");
    }catch(e){
      showMicBanner("⚠️ AI tutor error ("+e.message+"). Falling back to built-in tutor.");
      const intent=findIntent(text);
      let main=DEFAULT_INTENT[S.learn], sub=DEFAULT_INTENT[S.speak];
      if(intent){ main=intent.resp[S.learn].replace(/\{NAME\}/g,S.name||"friend"); sub=intent.resp[S.speak]; }
      lastBotText=main; lastBotLang=S.learn;
      addMsg("bot",main,sub,null,S.learn);
      speak(main,S.learn);
      addXp(3,"chatting (offline)");
    }finally{
      _im.textContent="";
    }
  } else {
    botRespond(text);
  }
}

/* ---------------- TRANSLATE ---------------- */
function translate(inputText,fromLang,autoSpeak){
  const text=String(inputText||"").trim();
  if(!text) return;
  let from=fromLang;
  if(!from){ from = hasScript(text,S.speak) ? S.speak : (hasScript(text,S.learn) ? S.learn : S.speak); }
  const to=from===S.learn?S.speak:S.learn;
  const result=document.getElementById("transresult");
  result.innerHTML='<div class="hint">Translating…</div>';
  const parts=[];
  const np=norm(text);
  const exact=PHRASEMAPS[from].get(np);
  const srcCode=from, dstCode=to;
  fetch("/api/translate?q="+encodeURIComponent(text)+"&from="+srcCode+"&to="+dstCode)
    .then(r=>r.json())
    .then(j=>{
      if(j&&j.ok&&j.text){
        parts.push('<div class="t-full"><div class="tag">🌐 Full translation (online)</div>'+
          '<div style="margin-top:4px;font-size:19px;">'+esc(j.text)+'</div>'+
          '<button class="mini" style="margin-top:8px;" data-tts="'+esc(j.text)+'" data-lang="'+to+'">🔊 Listen</button></div>');
      } else {
        parts.push('<div class="hint" style="margin-top:8px;">⚠️ Online translation unavailable — curated word-by-word below.</div>');
      }
      renderRest(parts,text,from,to,exact);
    })
    .catch(()=>{
      parts.push('<div class="hint" style="margin-top:8px;">⚠️ Online translation offline — curated word-by-word below.</div>');
      renderRest(parts,text,from,to,exact);
    });
  function renderRest(parts,text,from,to,exact){
    if(exact){
      const other=T(exact,to), othr=TR(exact,to);
      parts.push('<div class="t-full" style="background:linear-gradient(135deg,#fff6ec,#fff);border-color:#ffd9bd;"><div class="tag">📖 Curated phrase</div>'+
        '<div style="margin-top:4px;font-size:19px;">'+esc(other)+'</div>'+
        (othr?'<div class="tr-text">'+esc(othr)+'</div>':'')+
        '<button class="mini" style="margin-top:8px;" data-tts="'+esc(other)+'" data-lang="'+to+'">🔊 Listen</button></div>');
    }
    const words=text.split(/\s+/).filter(Boolean);
    const chips=[]; let hit=0;
    for(const w of words){
      const nw=norm(w);
      let e=WORDMAPS[from].get(nw)||PHRASEMAPS[from].get(nw);
      if(e){ hit++;
        chips.push('<span class="wchip"><b>'+esc(w)+'</b><small>'+esc(T(e,to))+(TR(e,to)?" · "+esc(TR(e,to)):"")+'</small></span>');
      } else {
        chips.push('<span class="wchip unknown"><b>'+esc(w)+'</b><small>not in phrase book</small></span>');
      }
    }
    if(words.length){
      parts.push('<div class="hint" style="margin-top:10px;">Word-by-word ('+hit+'/'+words.length+' found):</div><div class="chips">'+chips.join("")+'</div>');
    }
    result.innerHTML=parts.join("");
    result.querySelectorAll("[data-tts]").forEach(b=>{ b.onclick=()=>speak(b.getAttribute("data-tts"),b.getAttribute("data-lang")); });
    S.recents.unshift({text,from,to}); S.recents=S.recents.slice(0,6); save(); renderRecents();
    addXp(3,"translation");
    if(autoSpeak!==false){
      const full=result.querySelector(".t-full");
      if(full){ const d=full.querySelector("div[style]"); if(d) speak(d.textContent,to); }
    }
  }
}
function hasScript(text,lang){
  const ranges={ta:/[\u0B80-\u0BFF]/,hi:/[\u0900-\u097F]/,ml:/[\u0D00-\u0D7F]/};
  return ranges[lang]?ranges[lang].test(text):false;
}
function renderRecents(){
  const box=document.getElementById("recenttrans");
  if(!S.recents.length){ box.innerHTML=""; return; }
  box.innerHTML='<div class="hint" style="margin-bottom:4px;">Recent:</div>'+S.recents.map((r,i)=>
    '<button class="recent-item" data-i="'+i+'"><span>'+esc(r.text)+'</span><span class="arrow">'+LANGS[r.from].native.slice(0,4)+' → '+LANGS[r.to].native.slice(0,4)+' ➜</span></button>'
  ).join("");
  box.querySelectorAll(".recent-item").forEach(b=>{
    b.onclick=()=>{
      const r=S.recents[+b.getAttribute("data-i")];
      document.getElementById("transinput").value=r.text;
      translate(r.text,r.from);
    };
  });
}

/* ---------------- FLASHCARDS ---------------- */
let fCat="all", fIdx=0, fFailSet=new Set(), fFlipped=false;
function fDeckItems(){
  if(fCat==="all") return DICT.slice();
  if(fCat==="__mistakes") return DICT.filter(d=>fFailSet.has(d.id));
  if(fCat==="__notebook") return DICT.filter(d=>S.mistakes&&S.mistakes[d.id]);
  if(fCat==="__due") return srsDueList();
  return DICT.filter(d=>d.cat===fCat);
}
function fKnownCount(items){ let k=0; items.forEach(d=>{ if((S.known[d.cat]||[]).includes(d.id)) k++; }); return k; }
function renderCatbar(){
  const box=document.getElementById("catbar");
  let html='<button class="chip" data-c="all" style="'+(fCat==="all"?"border-color:var(--orange);color:var(--orange-dark);background:#fff4ec;":"")+'">⭐ All</button>';
  CATS.forEach(c=>{
    const on=fCat===c.id;
    html+='<button class="chip" data-c="'+c.id+'" style="'+(on?"border-color:var(--orange);color:var(--orange-dark);background:#fff4ec;":"")+'">'+c.icon+' '+c.en+'</button>';
  });
  if(fFailSet.size){
    const on=fCat==="__mistakes";
    html+='<button class="chip" data-c="__mistakes" style="'+(on?"border-color:var(--bad);color:var(--bad);background:#fdecec;":"border-color:#f0bcbc;color:var(--bad);")+'">🔁 Mistakes ('+fFailSet.size+')</button>';
  }
  const nbN=mistakeCount();
  if(nbN){
    const on=fCat==="__notebook";
    html+='<button class="chip" data-c="__notebook" style="'+(on?"border-color:var(--warn);color:var(--warn);background:#fff7e0;":"border-color:#f5cfa0;color:var(--warn);")+'">📓 Notebook ('+nbN+')</button>';
  }
  const dueN=srsDueList().length;
  if(dueN){
    const on=fCat==="__due";
    html+='<button class="chip" data-c="__due" style="'+(on?"border-color:var(--teal);color:var(--teal-dark);background:#e9fbf8;":"border-color:#b9ebe2;color:var(--teal-dark);")+'">🗓 To review ('+dueN+')</button>';
  }
  box.innerHTML=html;
  box.querySelectorAll(".chip").forEach(b=>{
    b.onclick=()=>{ fCat=b.getAttribute("data-c"); fIdx=0; renderCatbar(); renderCard(); };
  });
  const note=document.getElementById("srsnote");
  if(note) note.textContent="🧠 Spaced repetition: grade each card and it will resurface at the perfect time. '🗓 To review' = due cards + new words.";
}
function renderCard(){
  const items=fDeckItems();
  if(!items.length){
    document.getElementById("ffront").innerHTML='<div style="color:var(--ink-soft);font-size:15px;">No cards here yet — try another category 🌱</div>';
    document.getElementById("fback").innerHTML="";
    document.getElementById("fcount").textContent="0/0 known";
    document.getElementById("fbar").style.width="0%";
    return;
  }
  if(fIdx>=items.length) fIdx=0;
  const d=items[fIdx];
  const front=T(d,S.learn), frontTr=TR(d,S.learn), back=T(d,S.speak), backTr=TR(d,S.speak);
  const knownMark=(S.known[d.cat]||[]).includes(d.id)?'<div class="known-badge">✔ known</div>':"";
  document.getElementById("ffront").innerHTML=
    '<div class="big">'+esc(front)+'</div>'+(frontTr?'<div class="tr">'+esc(frontTr)+'</div>':'')+
    '<div class="hintflip">tap to flip</div>'+knownMark;
  document.getElementById("fback").innerHTML=
    '<div class="en">'+esc(back)+'</div>'+(backTr?'<div class="tr">'+esc(backTr)+'</div>':'')+
    '<div class="hintflip">tap to flip back</div>';
  document.getElementById("fcard").classList.remove("flipped");
  fFlipped=false;
  const known=fKnownCount(items), total=items.length;
  document.getElementById("fcount").textContent=known+"/"+total+" known";
  document.getElementById("fbar").style.width=(total?Math.round(100*known/total):0)+"%";
}
function fNext(){ fIdx=(fIdx+1)%Math.max(1,fDeckItems().length); renderCard(); }
function fMark(grade){ // "again" | "good" | "know"
  const items=fDeckItems(); if(!items.length) return;
  const d=items[fIdx];
  const arr=S.known[d.cat]=S.known[d.cat]||[];
  const uarr=S.unknown[d.cat]=S.unknown[d.cat]||[];
  const ki=arr.indexOf(d.id), ui=uarr.indexOf(d.id);
  if(grade==="know"){
    if(ki<0)arr.push(d.id); if(ui>=0)uarr.splice(ui,1);
    fFailSet.delete(d.id);
    S.mistakes=S.mistakes||{}; if(S.mistakes[d.id]) delete S.mistakes[d.id];
    srsGrade(d.id,5);
    save(); addXp(2,"got it"); beep("good");
  } else if(grade==="good"){
    if(ui>=0)uarr.splice(ui,1);
    srsGrade(d.id,3);
    save(); addXp(2,"good"); beep("good");
  } else {
    if(ui<0)uarr.push(d.id); if(ki>=0)arr.splice(ki,1);
    fFailSet.add(d.id);
    srsGrade(d.id,1);
    addMistake(d.id);
    save(); addXp(1,"will review"); beep("bad");
  }
  fNext(); renderCatbar();
}
function fAudio(){
  const items=fDeckItems(); if(!items.length) return;
  const d=items[fIdx];
  if(fFlipped) speak(T(d,S.speak),S.speak);
  else speak(T(d,S.learn),S.learn);
}

/* ---------------- QUIZ ---------------- */
const QZ={mode:null,items:[],i:0,score:0,streak:0,locked:false};
function startQuiz(mode){
  QZ.mode=mode; QZ.i=0; QZ.score=0; QZ.streak=0; QZ.locked=false; QZ.us=null;
  if(mode==="unscramble"||mode==="cloze"){
    let pool=PHR_ALL.filter(p=>T(p,S.learn).split(/\s+/).length>=3);
    if(pool.length<5) pool=PHR_ALL;
    QZ.items=shuffle(pool).slice(0,5);
  } else if(mode==="type"){
    let pool=PHR_ALL.filter(p=>{ const n=T(p,S.learn).split(/\s+/).length; return n>=2&&n<=5; });
    if(pool.length<5) pool=PHR_ALL;
    QZ.items=shuffle(pool).slice(0,5);
  } else {
    const pool=mode==="listen"?WORDS_ALL:WORDS_ALL.concat(PHR_ALL);
    QZ.items=shuffle(pool).slice(0,10);
  }
  document.getElementById("quizmenu").style.display="none";
  document.getElementById("quizdone").style.display="none";
  document.getElementById("quizplay").style.display="block";
  renderQuestion();
}
function renderQuestion(){
  const q=QZ.items[QZ.i];
  document.getElementById("qcount").textContent=(QZ.i+1)+"/"+QZ.items.length;
  document.getElementById("qstreak").textContent=QZ.streak;
  document.getElementById("qscore").textContent=QZ.score;
  const body=document.getElementById("qbody");
  if(QZ.mode==="ai"){ renderAiQuestion(q,body); return; }
  if(QZ.mode==="unscramble"){ renderUnscramble(q,body); return; }
  if(QZ.mode==="cloze"){ renderCloze(q,body); return; }
  if(QZ.mode==="type"){ renderDictation(q,body); return; }
  let head="";
  if(QZ.mode==="read"){
    head='<div style="font-size:13px;font-weight:800;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.5px;">What does this mean?</div>'+
      '<div class="qword">'+esc(T(q,S.speak))+'</div>'+
      (TR(q,S.speak)?'<div class="tr-text">'+esc(TR(q,S.speak))+'</div>':'');
  } else {
    head='<div style="font-size:13px;font-weight:800;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.5px;">Listen and pick what you hear</div>'+
      '<div class="qword">🔊</div>'+
      '<button class="mini" id="qplay" style="font-size:13px;padding:6px 14px;">🔊 Play again</button>';
  }
  const others=shuffle(DICT.filter(d=>d.id!==q.id&&(QZ.mode==="listen"||d.type===q.type))).slice(0,3);
  const opts=shuffle([q].concat(others));
  let html=head+'<div class="chips" style="flex-direction:column;align-items:stretch;">';
  opts.forEach(d=>{
    html+='<button class="qopt" data-id="'+d.id+'">'+esc(T(d,S.learn))+(TR(d,S.learn)?" <span style='opacity:.55;font-size:12px;'>("+esc(TR(d,S.learn))+")</span>":"")+'</button>';
  });
  html+="</div>";
  body.innerHTML=html;
  if(QZ.mode==="listen"){
    body.querySelectorAll(".qopt").forEach(b=>{
      b.onclick=()=>answerQuiz(b,q);
    });
    const pb=document.getElementById("qplay");
    pb.onclick=()=>speak(T(q,S.learn),S.learn);
    setTimeout(()=>speak(T(q,S.learn),S.learn),350);
  } else {
    body.querySelectorAll(".qopt").forEach(b=>{
      b.onclick=()=>answerQuiz(b,q);
    });
  }
}
function renderAiQuestion(q,body){
  body.innerHTML='<div style="font-size:13px;font-weight:800;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.5px;">🤖 AI quiz — pick the right answer</div>'
    +'<div class="qword" style="font-size:18px;line-height:1.55;">'+esc(q.q)+'</div>'
    +'<div class="chips" style="flex-direction:column;align-items:stretch;">'
    +q.options.map((op,i)=>'<button class="qopt" data-ai="'+i+'">'+esc(op)+'</button>').join("")
    +'</div><div class="hint" id="aiqexplain" style="margin-top:10px;min-height:18px;"></div>';
  body.querySelectorAll(".qopt").forEach(b=>{
    b.onclick=()=>{
      if(QZ.locked) return; QZ.locked=true;
      const i=+b.getAttribute("data-ai");
      const ok=i===q.answer;
      body.querySelectorAll(".qopt").forEach((x,xi)=>{ x.disabled=true; if(xi===q.answer) x.classList.add("correct"); });
      if(!ok) b.classList.add("wrong");
      document.getElementById("aiqexplain").textContent=q.explain||"";
      if(ok){ QZ.streak++; QZ.score++; beep("good"); addXp(3+(QZ.streak>=3?1:0),"AI quiz"); }
      else { QZ.streak=0; beep("bad"); }
      setTimeout(()=>{ QZ.locked=false; QZ.i++; if(QZ.i>=QZ.items.length) endQuiz(); else renderQuestion(); },ok?1300:2400);
    };
  });
}
function renderUnscramble(q,body){
  const words=T(q,S.learn).split(/\s+/);
  QZ.us={target:words,placed:[],pool:shuffle(words.map(w=>w))};
  body.innerHTML='<div style="font-size:13px;font-weight:800;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.5px;">🔀 Tap the words in the right order</div>'
    +(TR(q,S.learn)?'<div class="tr-text">'+esc(TR(q,S.learn))+'</div>':'')
    +'<div class="uchips" id="usplaced" title="your sentence"></div>'
    +'<div class="uchips" id="uspool"></div>';
  const pl=document.getElementById("usplaced"), po=document.getElementById("uspool");
  const draw=()=>{
    pl.innerHTML=QZ.us.placed.map((w,i)=>'<button class="uchip on" data-i="'+i+'">'+esc(w)+'</button>').join("");
    po.innerHTML=QZ.us.pool.map((w,i)=>'<button class="uchip" data-i="'+i+'">'+esc(w)+'</button>').join("");
    pl.querySelectorAll(".uchip").forEach(b=>{
      b.onclick=()=>{ QZ.us.placed.splice(+b.getAttribute("data-i"),1); draw(); checkUnscramble(q); };
    });
    po.querySelectorAll(".uchip").forEach(b=>{
      b.onclick=()=>{ QZ.us.pool.splice(+b.getAttribute("data-i"),1); QZ.us.placed.push(b.textContent); draw(); checkUnscramble(q); };
    });
  };
  draw();
}
function checkUnscramble(q){
  if(!QZ.us || QZ.us.placed.length!==QZ.us.target.length || QZ.locked) return;
  QZ.locked=true;
  const ok=QZ.us.placed.join(" ")===QZ.us.target.join(" ");
  const pl=document.getElementById("usplaced"), po=document.getElementById("uspool");
  po.innerHTML="";
  pl.innerHTML=QZ.us.target.map(w=>'<button class="uchip '+(ok?"good":"bad")+'" disabled>'+esc(w)+'</button>').join("");
  if(!ok){ pl.classList.add("ushake"); addMistake(q.id); }
  if(ok){ QZ.streak++; QZ.score++; beep("good"); addXp(4+(QZ.streak>=3?1:0),"unscramble"); }
  else { QZ.streak=0; beep("bad"); }
  setTimeout(()=>{ QZ.locked=false; QZ.i++; QZ.us=null; if(QZ.i>=QZ.items.length) endQuiz(); else renderQuestion(); },ok?900:2600);
}
function renderCloze(q,body){
  const words=T(q,S.learn).split(/\s+/);
  const wi=1+Math.floor(Math.random()*(words.length-1));
  const target=words[wi];
  const shown=words.map((w,i)=>i===wi?"______":w).join(" ");
  const others=shuffle(WORDS_ALL.filter(d=>norm(T(d,S.learn))!==norm(target))).slice(0,3).map(d=>T(d,S.learn));
  const opts=shuffle([target].concat(others));
  body.innerHTML='<div style="font-size:13px;font-weight:800;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.5px;">✍️ Pick the missing word</div>'
    +'<div class="qword" style="font-size:20px;line-height:1.55;">'+esc(shown)+'</div>'
    +(TR(q,S.learn)?'<div class="tr-text">'+esc(TR(q,S.learn))+'</div>':'')
    +'<div class="chips" style="flex-direction:column;align-items:stretch;">'
    +opts.map(o=>'<button class="qopt" data-txt="'+esc(o)+'">'+esc(o)+'</button>').join("")
    +'</div>';
  body.querySelectorAll(".qopt").forEach(b=>{
    b.onclick=()=>{
      if(QZ.locked) return; QZ.locked=true;
      const ok=norm(b.getAttribute("data-txt"))===norm(target);
      body.querySelectorAll(".qopt").forEach(x=>{
        x.disabled=true;
        if(norm(x.getAttribute("data-txt"))===norm(target)) x.classList.add("correct");
      });
      if(ok){ QZ.streak++; QZ.score++; beep("good"); addXp(3+(QZ.streak>=3?1:0),"fill the gap"); }
      else { b.classList.add("wrong"); QZ.streak=0; beep("bad"); addMistake(q.id); }
      setTimeout(()=>{ QZ.locked=false; QZ.i++; if(QZ.i>=QZ.items.length) endQuiz(); else renderQuestion(); },ok?800:1800);
    };
  });
}
function renderDictation(q,body){
  body.innerHTML='<div style="font-size:13px;font-weight:800;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.5px;">⌨️ Listen, then type what you hear ('+LANGS[S.learn].name+')</div>'
    +'<div class="qword">🔊</div>'
    +'<button class="mini" id="qplay2" style="font-size:13px;padding:6px 14px;">🔊 Play again</button>'
    +'<div class="inputrow" style="margin-top:14px;"><input id="qtypein" type="text" autocomplete="off" placeholder="Type the sentence…">'
    +'<button class="btn blue" id="qtypechk" style="border-radius:14px;flex:0 0 auto;">Check</button></div>'
    +'<div class="hint" id="qtypehint" style="margin-top:8px;min-height:18px;"></div>';
  const inp=document.getElementById("qtypein"), hint=document.getElementById("qtypehint");
  const play=()=>speak(T(q,S.learn),S.learn);
  document.getElementById("qplay2").onclick=play;
  setTimeout(play,350);
  const check=()=>{
    if(QZ.locked) return;
    const heard=String(inp.value).trim();
    if(!heard){ QZ.locked=false; return; }
    QZ.locked=true;
    const target=norm(T(q,S.learn));
    const sim=1-lev(target,norm(heard))/Math.max(target.length,1);
    const ok=sim>=0.75;
    hint.innerHTML=ok
      ? '<span style="color:var(--good);font-weight:800;">✔ Correct! ('+Math.round(sim*100)+'%)</span>'
      : '<span style="color:var(--bad);font-weight:700;">✘ '+Math.round(sim*100)+'% — right: <b>'+esc(T(q,S.learn))+'</b></span>';
    inp.disabled=true; document.getElementById("qtypechk").disabled=true;
    if(ok){ QZ.streak++; QZ.score++; beep("good"); addXp(4+(QZ.streak>=3?1:0),"dictation"); }
    else { QZ.streak=0; beep("bad"); if(sim<0.55) addMistake(q.id); }
    setTimeout(()=>{ QZ.locked=false; QZ.i++; if(QZ.i>=QZ.items.length) endQuiz(); else renderQuestion(); },ok?1000:2800);
  };
  document.getElementById("qtypechk").onclick=check;
  inp.addEventListener("keydown",e=>{ if(e.key==="Enter") check(); });
  setTimeout(()=>inp.focus(),100);
}

function answerQuiz(btn,q){
  if(QZ.locked) return;
  QZ.locked=true;
  const ok=btn.getAttribute("data-id")===q.id;
  document.querySelectorAll("#qbody .qopt").forEach(b=>{
    b.disabled=true;
    if(b.getAttribute("data-id")===q.id) b.classList.add("correct");
  });
  if(ok){
    QZ.streak++; QZ.score++;
    beep("good");
    addXp(3+(QZ.streak>=3?1:0),QZ.streak>=3?"quiz streak +4":"quiz correct");
  } else {
    btn.classList.add("wrong");
    QZ.streak=0;
    beep("bad");
    if(q&&q.id) addMistake(q.id);
  }
  setTimeout(()=>{
    QZ.locked=false; QZ.i++;
    if(QZ.i>=QZ.items.length) endQuiz(); else renderQuestion();
  },ok?800:1600);
}
function endQuiz(){
  document.getElementById("quizplay").style.display="none";
  document.getElementById("quizdone").style.display="block";
  const n=QZ.score;
  S.bestQuiz=Math.max(S.bestQuiz||0,Math.round(10*n/QZ.items.length));
  save();
  document.getElementById("qfinal").textContent=n+"/"+QZ.items.length;
  document.getElementById("qemoji").textContent=n>=9?"🏆":n>=6?"🌟":n>=4?"💪":"🌱";
  document.getElementById("qmsg").textContent=n>=9?"Perfect! You are on fire!":n>=6?"Great job! Keep going!":n>=4?"Good start — review and retry!":"No problem — mistakes make masters. Try again!";
}

/* ---------------- LESSON ---------------- */
const LS={cat:null,step:0,word:null,phrase:null,quiz:[],qi:0,qok:0,sayPhrase:null,done:false};
function renderLessonCats(){
  const box=document.getElementById("lessoncats");
  box.innerHTML=CATS.map(c=>'<button class="chip" data-c="'+c.id+'">'+c.icon+' '+c.en+'</button>').join("");
  box.querySelectorAll(".chip").forEach(b=>{
    b.onclick=()=>startLesson(b.getAttribute("data-c"));
  });
}
function startLesson(cat){
  const words=WORDS_ALL.filter(d=>d.cat===cat);
  const phrases=PHR_ALL.filter(d=>d.cat===cat);
  if(!words.length&&!phrases.length){ toast("No content for this category yet 🌱"); return; }
  LS.cat=cat; LS.step=0;
  LS.word=words[Math.floor(Math.random()*words.length)];
  LS.phrase=phrases.length?phrases[Math.floor(Math.random()*phrases.length)]:LS.word;
  LS.quiz=shuffle(words.concat(phrases)).slice(0,3);
  LS.qi=0; LS.qok=0;
  LS.sayPhrase=LS.phrase;
  LS.done=false;
  document.getElementById("lessonmenu").style.display="none";
  document.getElementById("lessonplay").style.display="block";
  renderLessonStep();
}
function renderLessonStep(){
  const steps=document.getElementById("lsteps");
  steps.innerHTML=[0,1,2,3,4].map(i=>'<div class="lstep '+(i<LS.step?"done":"")+'"><i></i></div>').join("");
  const body=document.getElementById("lbody");
  const act=document.getElementById("lactions");
  const catName=(CATS.find(c=>c.id===LS.cat)||{en:LS.cat}).en;
  if(LS.step===0){
    const e=LS.word;
    body.innerHTML='<div class="lcard"><div class="hint" style="font-weight:800;">STEP 1 · Learn the word ('+catName+')</div>'+
      '<div class="big">'+esc(T(e,S.learn))+'</div>'+(TR(e,S.learn)?'<div class="tr-text">'+esc(TR(e,S.learn))+'</div>':'')+
      '<div style="font-size:15px;margin-top:6px;color:var(--ink-soft);">'+esc(T(e,S.speak))+'</div>'+
      '<button class="mini" style="margin-top:12px;font-size:13px;padding:7px 14px;" id="laudio1">🔊 Listen</button></div>';
    act.innerHTML='<button class="btn green big" id="lnext">Got it →</button>';
    document.getElementById("laudio1").onclick=()=>speak(T(e,S.learn),S.learn);
    document.getElementById("lnext").onclick=()=>{ LS.step=1; addXp(2,"lesson word"); beep("good"); renderLessonStep(); };
  }
  else if(LS.step===1){
    const e=LS.phrase;
    body.innerHTML='<div class="lcard"><div class="hint" style="font-weight:800;">STEP 2 · Learn the phrase</div>'+
      '<div class="big" style="font-size:24px;">'+esc(T(e,S.learn))+'</div>'+(TR(e,S.learn)?'<div class="tr-text">'+esc(TR(e,S.learn))+'</div>':'')+
      '<div style="font-size:15px;margin-top:6px;color:var(--ink-soft);">'+esc(T(e,S.speak))+'</div>'+
      '<button class="mini" style="margin-top:12px;font-size:13px;padding:7px 14px;" id="laudio2">🔊 Listen</button></div>';
    act.innerHTML='<button class="btn green big" id="lnext">Got it →</button>';
    document.getElementById("laudio2").onclick=()=>speak(T(e,S.learn),S.learn);
    document.getElementById("lnext").onclick=()=>{ LS.step=2; addXp(2,"lesson phrase"); beep("good"); renderLessonStep(); };
  }
  else if(LS.step===2){
    renderLessonQuiz(body,act);
  }
  else if(LS.step===3){
    const e=LS.sayPhrase;
    body.innerHTML='<div class="lcard"><div class="hint" style="font-weight:800;">STEP 4 · Say it out loud</div>'+
      '<div class="big" style="font-size:24px;">'+esc(T(e,S.learn))+'</div>'+(TR(e,S.learn)?'<div class="tr-text">'+esc(TR(e,S.learn))+'</div>':'')+
      '<button class="mini" style="margin-top:12px;font-size:13px;padding:7px 14px;" id="laudio4">🔊 Listen first</button>'+
      '<div class="score" id="lscore" style="margin-top:14px;"></div>'+
      '<div class="heard" id="lheard"></div></div>';
    document.getElementById("laudio4").onclick=()=>speak(T(e,S.learn),S.learn);
    const micBtn=document.createElement("button");
    micBtn.className="btn blue"; micBtn.textContent="🎤 Say it now";
    micBtn.onclick=()=>{
      if(!SR){ toast("Mic not supported here — use Chrome/Edge 🎤"); return; }
      if(recBusy) return;
      recBusy=true; setMic(true);
      rec=newRec(S.learn,{ text:t=>{
        const target=norm(T(e,S.learn)), heard=norm(t);
        const sim=1-lev(target,heard)/Math.max(target.length,1);
        const sc=document.getElementById("lscore");
        document.getElementById("lheard").textContent='Heard: "'+t+'"';
        if(sim>=0.8){ sc.textContent="🎉 Perfect! ("+Math.round(sim*100)+"%)"; sc.className="score good"; S.perfect++; save(); addXp(5,"lesson pronunciation"); beep("good"); }
        else { sc.textContent="👍 " + (sim>=0.5?"Good!":"Try again!") + " ("+Math.round(sim*100)+"%)"; sc.className=sim>=0.5?"score ok":"score bad"; beep(sim>=0.5?"good":"bad"); }
      }},()=>{ rec=null; });
      try{ rec.start(); }catch(err){ recBusy=false; setMic(false); }
    };
    const skipBtn=document.createElement("button");
    skipBtn.className="btn ghost"; skipBtn.textContent="⏭ Skip";
    skipBtn.onclick=()=>{ LS.step=4; renderLessonStep(); };
    act.innerHTML="";
    act.appendChild(micBtn); act.appendChild(skipBtn);
  }
  else if(LS.step===4){
    body.innerHTML='<div class="lcard"><div style="font-size:44px;">🎉</div>'+
      '<div class="big">Lesson complete!</div>'+
      '<div class="hint" style="margin-top:6px;">You learned "'+esc(LS.word?T(LS.word,S.learn):"")+ '" and "'+esc(T(LS.sayPhrase,S.learn))+'" in '+(CATS.find(c=>c.id===LS.cat)||{en:catName}).en+". Quiz score: "+LS.qok+"/3.</div></div>";
    act.innerHTML='<button class="btn blue" id="lchoose">📚 Another lesson</button><button class="btn ghost" id="lfine">Done</button>';
    document.getElementById("lchoose").onclick=()=>{ document.getElementById("lessonplay").style.display="none"; document.getElementById("lessonmenu").style.display="block"; renderLessonCats(); };
    document.getElementById("lfine").onclick=()=>switchView("progress");
    addXp(5,"lesson complete");
  }
}
function renderLessonQuiz(body,act){
  const q=LS.quiz[LS.qi];
  body.innerHTML='<div class="lcard"><div class="hint" style="font-weight:800;">STEP 3 · Mini-quiz ('+(LS.qi+1)+'/3)</div>'+
    '<div class="qword" style="font-size:20px;">What is this in '+(LANGS[S.learn].native)+ '?<br>'+esc(T(q,S.speak))+'</div></div>'+
    '<div class="chips" style="flex-direction:column;align-items:stretch;" id="lquizopts"></div>';
  const box=document.getElementById("lquizopts");
  const others=shuffle(DICT.filter(d=>d.id!==q.id)).slice(0,3);
  shuffle([q].concat(others)).forEach(d=>{
    const b=document.createElement("button"); b.className="qopt"; b.textContent=T(d,S.learn);
    b.onclick=()=>{
      const ok=d.id===q.id;
      box.querySelectorAll(".qopt").forEach(x=>{ x.disabled=true; if(x===b) x.classList.add(ok?"correct":"wrong"); });
      if(ok){ LS.qok++; beep("good"); addXp(2,"lesson quiz"); }
      else { beep("bad"); addMistake(q.id); }
      setTimeout(()=>{ LS.qi++; if(LS.qi>=LS.quiz.length){ LS.step=3; } renderLessonStep(); },ok?700:1400);
    };
    box.appendChild(b);
  });
  act.innerHTML='<button class="btn ghost" id="lexit">✕ Quit lesson</button>';
  document.getElementById("lexit").onclick=()=>{ document.getElementById("lessonplay").style.display="none"; document.getElementById("lessonmenu").style.display="block"; };
}

/* ---------------- SAY IT ---------------- */
let pPhrase=null, pCat="all";
function pNewPhrase(){
  const pool=pCat==="all"?PHR_ALL:PHR_ALL.filter(p=>p.cat===pCat);
  const list=pool.length?pool:PHR_ALL;
  pPhrase=list[Math.floor(Math.random()*list.length)];
  const txt=T(pPhrase,S.learn);
  document.getElementById("pphrase").innerHTML=
    '<div class="hint" style="font-weight:700;letter-spacing:.5px;">SAY THIS ('+LANGS[S.learn].name.toUpperCase()+')</div>'+
    '<div class="big">'+esc(txt)+'</div>'+(TR(pPhrase,S.learn)?'<div class="tr">'+esc(TR(pPhrase,S.learn))+'</div>':'')+
    '<button class="mini" style="margin-top:10px;" id="plisten">🔊 Listen first</button>';
  document.getElementById("plisten").onclick=()=>speak(txt,S.learn);
  document.getElementById("pscore").textContent="";
  document.getElementById("pscore").className="score";
  document.getElementById("pheard").textContent="";
  document.getElementById("phint").textContent="💡 Show hint";
  document.getElementById("phint").onclick=()=>{
    const cur=document.getElementById("phint").textContent;
    document.getElementById("phint").textContent=cur.indexOf("Show")===0
      ? "🙈 Hide hint ("+T(pPhrase,S.speak)+")"
      : "💡 Show hint";
  };
}
function pScore(heardText){
  const target=norm(T(pPhrase,S.learn));
  const heard=norm(heardText);
  const dist=lev(target,heard);
  const sim=1-dist/Math.max(target.length,1);
  const sc=document.getElementById("pscore");
  document.getElementById("pheard").textContent='Heard: "'+heardText+'"';
  if(sim>=0.82){
    sc.textContent="🎉 Perfect! ("+Math.round(sim*100)+"%)"; sc.className="score good";
    S.perfect++; save();
    addXp(8,"perfect pronunciation"); beep("level");
    setTimeout(pNewPhrase,1800);
  } else if(sim>=0.55){
    sc.textContent="👍 Good! ("+Math.round(sim*100)+"%) — try again for full marks"; sc.className="score ok";
    addXp(4,"nice try"); beep("good");
  } else {
    sc.textContent="🔁 Not quite ("+Math.round(sim*100)+"%) — listen again and retry"; sc.className="score bad";
    beep("bad"); addMistake(pPhrase.id);
  }
}

/* ---------------- PROGRESS / XP ---------------- */
function renderXp(){
  document.getElementById("xpval").textContent=S.xp+" XP";
  document.getElementById("lvlval").textContent=LEVELS[levelOf(S.xp)].en;
  document.getElementById("streakval").textContent=S.streak;
}
function renderProgress(){
  document.getElementById("st-xp").textContent=S.xp;
  document.getElementById("st-streak").textContent=S.streak;
  const knownTotal=Object.values(S.known).reduce((a,b)=>a+b.length,0);
  document.getElementById("st-known").textContent=knownTotal;
  document.getElementById("st-chat").textContent=S.chatCount;
  const li=levelOf(S.xp);
  document.getElementById("st-level").textContent=li+1;
  document.getElementById("st-perfect").textContent=S.perfect;
  document.getElementById("st-mistakes").textContent=mistakeCount();
  document.getElementById("st-favs").textContent=Object.keys(S.favs||{}).length;
  document.getElementById("lvlname2").textContent=LEVELS[li].en;
  renderBadges();
  const nl=nextLevel(S.xp), base=LEVELS[li].min;
  document.getElementById("lvlbar").style.width=nl?Math.round(100*(S.xp-base)/(nl-base)):"100%";
  touchStreak();
  const gp=S.goal?Math.min(100,Math.round(100*S.today.xp/S.goal)):0;
  document.getElementById("goalbar").style.width=gp+"%";
  document.getElementById("goaltxt").textContent=S.today.xp+"/"+S.goal+" XP";
  const box=document.getElementById("catmastery");
  box.innerHTML=CATS.map(c=>{
    const items=DICT.filter(d=>d.cat===c.id);
    const k=(S.known[c.id]||[]).filter(id=>items.some(d=>d.id===id)).length;
    const pct=items.length?Math.round(100*k/items.length):0;
    return '<div class="catrow"><span class="nm">'+c.icon+' '+c.en+'</span>'+
      '<div class="pbar"><i style="width:'+pct+'%;background:'+(pct>=70?"var(--good)":pct>=30?"linear-gradient(90deg,var(--teal),#37c4b4)":"var(--gold)")+'"></i></div>'+
      '<span class="pct">'+k+"/"+items.length+'</span></div>';
  }).join("");
}

/* ---------------- WORD OF DAY ---------------- */
function renderWot(){
  const day=Math.floor(Date.now()/86400000);
  const e=WORDS_ALL[(day*7+LCODES.indexOf(S.learn))%WORDS_ALL.length];
  document.getElementById("wot").innerHTML=
    '<span class="lbl">🌟 Word of the day</span>'+
    '<span class="grow"><b>'+esc(T(e,S.learn))+'</b>'+(TR(e,S.learn)?' <i>('+esc(TR(e,S.learn))+')</i>':'')+' = '+esc(T(e,S.speak))+'</span>'+ 
    '<button class="mini" id="wotlisten">🔊</button>';
  document.getElementById("wotlisten").onclick=()=>speak(T(e,S.learn),S.learn);
}

/* ============================================================
   V3 FEATURES — confetti · badges · mistake notebook · spaced
   repetition · words browser · unscramble/cloze/dictation ·
   AI quiz/story · free conversation · shadowing · backup
   ============================================================ */

/* ---- confetti ---- */
function confetti(){
  try{
    const c=document.createElement("canvas");
    c.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:999;";
    document.body.appendChild(c);
    const ctx=c.getContext("2d");
    c.width=window.innerWidth; c.height=window.innerHeight;
    const cols=["#ff6a3d","#0f9d8f","#ffb703","#2f9e44","#e03131","#37c4b4","#ff9d5c","#f77f00"];
    const ps=Array.from({length:130},()=>({
      x:Math.random()*c.width, y:-30-Math.random()*c.height*0.4,
      w:6+Math.random()*7, h:8+Math.random()*8,
      vx:(Math.random()-.5)*3, vy:2.2+Math.random()*3,
      r:Math.random()*Math.PI, vr:(Math.random()-.5)*.22,
      col:cols[Math.floor(Math.random()*cols.length)]
    }));
    const t0=performance.now();
    (function tick(t){
      const el=t-t0;
      ctx.clearRect(0,0,c.width,c.height);
      ps.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.r+=p.vr;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r);
        ctx.fillStyle=p.col; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
      });
      if(el<2600) requestAnimationFrame(tick); else c.remove();
    })(t0);
  }catch(e){}
}

/* ---- badges ---- */
function knownTotal(){ return Object.values(S.known||{}).reduce((a,b)=>a+b.length,0); }
const BADGES=[
  {id:"first",   icon:"🌱", name:"First Steps",      desc:"Earn your first XP",                    test:s=>s.xp>0},
  {id:"words10", icon:"📖", name:"Word Collector",   desc:"Know 10 words",                         test:s=>knownTotal()>=10},
  {id:"words50", icon:"📚", name:"Wordsmith",        desc:"Know 50 words",                         test:s=>knownTotal()>=50},
  {id:"conv10",  icon:"💬", name:"Chatterbox",       desc:"Send 10 chat messages",                 test:s=>s.chatCount>=10},
  {id:"conv50",  icon:"🗣️", name:"Storyteller",      desc:"Send 50 chat messages",                 test:s=>s.chatCount>=50},
  {id:"streak3", icon:"🔥", name:"On a Roll",        desc:"3-day streak",                          test:s=>s.streak>=3},
  {id:"streak7", icon:"🌋", name:"Week Warrior",     desc:"7-day streak",                          test:s=>s.streak>=7},
  {id:"perf10",  icon:"🎯", name:"Pronunciation Pro",desc:"10 perfect sayings",                    test:s=>s.perfect>=10},
  {id:"quiz9",   icon:"🏆", name:"Quiz Wizard",      desc:"Score 9+/10 in a quiz",                 test:s=>(s.bestQuiz||0)>=9},
  {id:"ai1",     icon:"🤖", name:"AI Pal",           desc:"Chat with the AI tutor",                test:s=>(s.aiChats||0)>=1},
  {id:"xp500",   icon:"💎", name:"Half a Thousand",  desc:"Reach 500 XP",                          test:s=>s.xp>=500},
  {id:"xp1200",  icon:"👑", name:"Grand Master",     desc:"Reach Master level (1200 XP)",          test:s=>s.xp>=1200},
  {id:"actor",  icon:"🎭", name:"Stage Star",     desc:"Complete a roleplay scene",           test:s=>(s.scenesDone||0)>=1},
];
function checkBadges(){
  let got=false;
  BADGES.forEach(b=>{
    if(!(S.badges||{})[b.id] && b.test(S)){
      S.badges=S.badges||{}; S.badges[b.id]=Date.now(); got=true;
      toast("🏅 Badge unlocked: "+b.icon+" <b>"+b.name+"</b> — "+b.desc,4200);
      beep("level"); confetti();
    }
  });
  if(got){
    save();
    if(document.getElementById("view-progress").classList.contains("on")) renderBadges();
  }
}
function renderBadges(){
  const box=document.getElementById("bgrid"); if(!box) return;
  const n=Object.keys(S.badges||{}).length;
  document.getElementById("badgecount").textContent="("+n+"/"+BADGES.length+")";
  box.innerHTML=BADGES.map(b=>{
    const un=!!(S.badges||{})[b.id];
    return '<div class="bcell'+(un?"":" lock")+'" title="'+(un?"Unlocked":"Locked")+'"><div class="bi">'+b.icon+'</div>'
      +'<div class="bn">'+b.name+'</div><div class="bd">'+b.desc+'</div></div>';
  }).join("");
}

/* ---- mistake notebook (persistent) ---- */
function addMistake(id){
  const e=BYID[id]; if(!e) return;
  S.mistakes=S.mistakes||{};
  const m=S.mistakes[id]||(S.mistakes[id]={n:0,last:0});
  const isNew=!m.n;
  m.n++; m.last=Date.now();
  save();
  if(isNew) toast("📓 Added to your mistake notebook: <b>"+esc(T(e,S.learn))+"</b>",3000);
}
function mistakeCount(){ return S.mistakes?Object.keys(S.mistakes).length:0; }

/* ---- spaced repetition (SM-2) ---- */
function srsGrade(id,q){
  S.srs=S.srs||{};
  const st=S.srs[id]||(S.srs[id]={due:0,itv:0,ease:2.5,reps:0});
  if(q<3){
    st.reps=0; st.itv=0; st.due=Date.now()+86400000;
  } else {
    st.reps++;
    if(st.reps===1) st.itv=1;
    else if(st.reps===2) st.itv=6;
    else st.itv=Math.max(st.itv,1)*st.ease;
    st.itv=Math.round(st.itv);
    st.ease=Math.max(1.3, st.ease+(0.1-(5-q)*(0.08+(5-q)*0.02)));
    st.due=Date.now()+st.itv*86400000;
  }
}
function srsDueList(){
  const now=Date.now();
  return DICT.filter(d=>{
    const st=S.srs&&S.srs[d.id];
    return !st || st.due<=now;
  });
}

/* ---- WORDS BROWSER (search + star) ---- */
let wQuery="", wCat="all", wFavsOnly=false;
function renderWords(){
  const q=norm(wQuery);
  const favN=Object.keys(S.favs||{}).length;
  const box=document.getElementById("wchips");
  let h='<button class="chip" data-wc="all" '+(wCat==="all"&&!wFavsOnly?"style='border-color:var(--orange);color:var(--orange-dark);background:#fff4ec;'":"")+'>⭐ All</button>';
  CATS.forEach(c=>{
    h+='<button class="chip" data-wc="'+c.id+'" '+(wCat===c.id?"style='border-color:var(--orange);color:var(--orange-dark);background:#fff4ec;'":"")+'> '+c.icon+' '+c.en+'</button>';
  });
  h+='<button class="chip" data-wc="__favs" '+(wFavsOnly?"style='border-color:var(--gold);color:var(--orange-dark);background:#fff4ec;'":"")+'>⭐ Starred ('+favN+')</button>';
  box.innerHTML=h;
  box.querySelectorAll(".chip").forEach(b=>{
    b.onclick=()=>{
      const c=b.getAttribute("data-wc");
      if(c==="__favs") wFavsOnly=!wFavsOnly;
      else { wCat=c; wFavsOnly=false; }
      renderWords();
    };
  });
  const list=document.getElementById("wordslist");
  let items=DICT.filter(d=>(!wFavsOnly||(S.favs||{})[d.id]) && (wCat==="all"||d.cat===wCat));
  if(q){
    items=items.filter(d=> LCODES.some(L=> norm(T(d,L)).includes(q) || norm(TR(d,L)).includes(q)) || norm(d.cat).includes(q));
  }
  if(!items.length){ list.innerHTML='<div class="hint" style="padding:14px;">No words found — try another search 🌱</div>'; return; }
  list.innerHTML=items.map(d=>{
    const fav=!!(S.favs||{})[d.id];
    const icon=((CATS.find(c=>c.id===d.cat))||{icon:""}).icon;
    return '<div class="wordrow">'
      +'<button class="starbtn'+(fav?" on":"")+'" data-id="'+d.id+'" title="Star / unstar">'+(fav?"★":"☆")+'</button>'
      +'<div class="wgrow"><div class="wt"><b>'+esc(T(d,S.learn))+'</b>'+(TR(d,S.learn)?' <i>'+esc(TR(d,S.learn))+'</i>':'')+'</div>'
      +'<div class="wm">'+icon+' '+esc(T(d,S.speak))+' · '+(d.type==="p"?"phrase":"word")+'</div></div>'
      +'<button class="mini" data-ttsid="'+d.id+'">🔊</button></div>';
  }).join("");
  list.querySelectorAll(".starbtn").forEach(b=>{
    b.onclick=()=>{
      const id=b.getAttribute("data-id");
      S.favs=S.favs||{};
      if(S.favs[id]) delete S.favs[id]; else S.favs[id]=Date.now();
      save(); renderWords();
    };
  });
  list.querySelectorAll("[data-ttsid]").forEach(b=>{
    b.onclick=()=>{ const d=BYID[b.getAttribute("data-ttsid")]; speak(T(d,S.learn),S.learn); };
  });
}

/* ---- SHADOWING (say-it, full sentences) ---- */
let shPhrase=null;
function shNew(){
  const p=PHR_ALL[Math.floor(Math.random()*PHR_ALL.length)];
  shPhrase=p;
  const txt=T(p,S.learn);
  document.getElementById("shphrase").innerHTML=
    '<div class="hint" style="font-weight:700;letter-spacing:.5px;">SHADOW THIS ('+LANGS[S.learn].name.toUpperCase()+')</div>'
    +'<div class="big" style="font-size:22px;">'+esc(txt)+'</div>'
    +(TR(p,S.learn)?'<div class="tr">'+esc(TR(p,S.learn))+'</div>':'')
    +'<button class="mini" style="margin-top:10px;" id="shplay">🔊 Listen (2×)</button>';
  document.getElementById("shplay").onclick=()=>{
    speak(txt,S.learn);
    setTimeout(()=>speak(txt,S.learn,0.7), 900+txt.length*170);
  };
  document.getElementById("shscore").textContent="";
  document.getElementById("shscore").className="score";
  document.getElementById("shheard").textContent="";
  document.getElementById("shhint").textContent="💡 Show meaning";
  document.getElementById("shhint").onclick=()=>{
    const el=document.getElementById("shhint");
    el.textContent=el.textContent.indexOf("Show")===0 ? "🙈 Hide meaning ("+T(p,S.speak)+")" : "💡 Show meaning";
  };
  if(document.getElementById("view-speak").classList.contains("on")) setTimeout(()=>speak(txt,S.learn),350);
}
function shScore(heard){
  if(!shPhrase) return;
  const target=norm(T(shPhrase,S.learn));
  const h=norm(heard);
  const sim=1-lev(target,h)/Math.max(target.length,1);
  const sc=document.getElementById("shscore");
  document.getElementById("shheard").textContent='Heard: "'+heard+'"';
  if(sim>=0.75){
    sc.textContent="🎉 Excellent shadowing! ("+Math.round(sim*100)+"%)"; sc.className="score good";
    S.perfect++; save();
    addXp(8,"perfect shadowing"); beep("level");
    setTimeout(shNew,2000);
  } else if(sim>=0.5){
    sc.textContent="👍 Good! ("+Math.round(sim*100)+"%) — shadow it again for full marks"; sc.className="score ok";
    addXp(4,"nice shadowing"); beep("good");
  } else {
    sc.textContent="🔁 Not quite ("+Math.round(sim*100)+"%) — listen again and retry"; sc.className="score bad";
    beep("bad"); addMistake(shPhrase.id);
  }
}

/* ---- FREE CONVERSATION MODE (AI) ---- */
function toggleConv(){
  if(!S.convOn && !aiReady()){
    toast("Free conversation needs the AI tutor — enable it in ⚙️ (the free option needs no key) 🤖");
    openSettings(); return;
  }
  S.convOn=!S.convOn; save();
  document.getElementById("convbtn").textContent="🗣 Free conversation: "+(S.convOn?"ON":"OFF");
  if(S.convOn){
    addMsg("bot","Free conversation ON! 🗣 Let's talk about anything — your day, food, travel, dreams. I'll stay in "+LANGS[S.learn].name+" and translate for you. When you're done, tap '📝 Review session' for a summary.",null,null,S.learn);
  } else {
    addMsg("bot","Back to tutor mode — I'll guide you with topics, phrases and corrections. 🎓",null,null,S.learn);
  }
}

/* ---- SESSION REVIEW (AI) ---- */
async function sessionReview(){
  if(!aiReady()){ toast("Session review needs the AI tutor — enable it in ⚙️ (the free option needs no key) 🤖"); openSettings(); return; }
  if(!CHAT_HIST.length){ toast("Chat with me a little first, then I'll review us 💬"); return; }
  const btn=document.getElementById("reviewbtn");
  btn.disabled=true; btn.textContent="📝 Reviewing…";
  addMsg("user","📝 Please review our session",null,null,null);
  const sys='You are reviewing a language practice conversation. The user was practicing '+LANGS[S.learn].name+' (they speak '+LANGS[S.speak]+'). Reply with ONLY valid JSON (no markdown): '
    +'{"summary":"2-3 sentences in '+LANGS[S.speak].name+' about how the practice went and what they did well",'
    +'"mistakes":[{"said":"what they said (in '+LANGS[S.learn].name+')","fix":"the better version","why":"short reason in '+LANGS[S.speak].name+'"}] (up to 3 most important; empty array if none),'
    +'"newwords":[{"w":"useful phrase in '+LANGS[S.learn].name+'","m":"meaning in '+LANGS[S.speak].name+'"}] (exactly 3 phrases useful for them next time)}';
  const msgs=[{role:"system",content:sys}];
  CHAT_HIST.slice(-16).forEach(m=>msgs.push({role:m.role==="assistant"?"assistant":m.role,content:m.content}));
  try{
    const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({provider:S.ai.provider,key:S.ai.key,model:S.ai.model,messages:msgs,max_tokens:800})});
    const j=await r.json();
    if(!j.ok) throw new Error(j.error||"AI request failed");
    let s=String(j.text).trim().replace(/^```(?:json)?/,"").replace(/```$/,"").trim();
    const a=s.indexOf("{"), b=s.lastIndexOf("}");
    if(a>=0&&b>a) s=s.slice(a,b+1);
    const o=JSON.parse(s);
    renderReviewCard(o);
    addXp(10,"session review");
  }catch(e){
    showMicBanner("⚠️ Review failed: "+e.message);
  }finally{
    btn.disabled=false; btn.textContent="📝 Review session";
  }
}
function renderReviewCard(o){
  const div=document.createElement("div"); div.className="msg bot";
  const who=document.createElement("div"); who.className="who"; who.textContent="Talkora 🤖 · Session review";
  div.appendChild(who);
  const card=document.createElement("div"); card.className="bub";
  let h="<b>📝 Session review</b><br>"+esc(o.summary||"Great practice!");
  if(Array.isArray(o.mistakes)&&o.mistakes.length){
    h+="<br><br><b>Corrections:</b>";
    o.mistakes.slice(0,3).forEach(m=>{
      h+="<br><span style='color:var(--bad);text-decoration:line-through;'>"+esc(m.said||"")+"</span> → <b style='color:var(--good);'>"+esc(m.fix||"")+"</b>"+(m.why?" <i>("+esc(m.why)+")</i>":"");
    });
  }
  if(Array.isArray(o.newwords)&&o.newwords.length){
    h+="<br><br><b>✨ Learn these next:</b>";
    o.newwords.slice(0,3).forEach(w=>{ h+="<br>• "+esc(w.w||"")+" — "+esc(w.m||""); });
  }
  card.innerHTML=h;
  div.appendChild(card);
  const a=document.createElement("div"); a.className="actions";
  const b=document.createElement("button"); b.className="mini"; b.textContent="🔊 Listen to summary";
  b.onclick=()=>speak(String(o.summary||""),S.speak);
  a.appendChild(b); div.appendChild(a);
  chatlog.appendChild(div);
  chatlog.scrollTop=chatlog.scrollHeight;
}

/* ---- AI QUIZ ---- */
async function aiQuiz(topic){
  if(!aiReady()){ toast("Enable the AI tutor in ⚙️ Settings first (the free option needs no key) 🤖"); openSettings(); return; }
  const btn=document.getElementById("aquizbtn");
  btn.disabled=true; btn.textContent="Thinking…";
  document.getElementById("qlistennote").textContent="🤖 Generating 5 custom questions…";
  try{
    const sys='You generate language-learning quizzes. The user speaks '+LANGS[S.speak].name+' and is learning '+LANGS[S.learn].name+'. Topic: '+(topic&&String(topic).trim()?"everyday vocabulary about "+String(topic).trim():"everyday life")+'. Level: A2-B1 mixed. Reply with ONLY valid JSON (no markdown): '
      +'{"questions":[{"q":"question in '+LANGS[S.speak].name+'","options":["...","...","...","..."],"answer":0,"explain":"one short explanation in '+LANGS[S.speak].name+'"}]} '
      +'- exactly 5 questions, all 4 options in '+LANGS[S.learn].name+', "answer" is the 0-based index of the correct option, options in a sensible (not always alphabetical) order.';
    const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({provider:S.ai.provider,key:S.ai.key,model:S.ai.model,
        messages:[{role:"system",content:sys},{role:"user",content:"Generate the quiz now."}],max_tokens:900})});
    const j=await r.json();
    if(!j.ok) throw new Error(j.error||"AI request failed");
    let s=String(j.text).trim().replace(/^```(?:json)?/,"").replace(/```$/,"").trim();
    const a=s.indexOf("{"), b=s.lastIndexOf("}");
    if(a>=0&&b>a) s=s.slice(a,b+1);
    const o=JSON.parse(s);
    const qs=(Array.isArray(o.questions)?o.questions:[])
      .map(x=>({
        q:String(x.q||"").trim(),
        options:(Array.isArray(x.options)?x.options:[]).map(String),
        answer:parseInt(x.answer,10),
        explain:String(x.explain||"")
      }))
      .filter(x=>x.q&&x.options.length>=2)
      .map(x=>{ x.answer=Math.max(0,Math.min(x.options.length-1,isNaN(x.answer)?0:x.answer)); return x; })
      .slice(0,5);
    if(!qs.length) throw new Error("the AI returned no usable questions");
    QZ.mode="ai"; QZ.items=qs; QZ.i=0; QZ.score=0; QZ.streak=0; QZ.locked=false; QZ.us=null;
    document.getElementById("quizmenu").style.display="none";
    document.getElementById("quizdone").style.display="none";
    document.getElementById("quizplay").style.display="block";
    renderQuestion();
  }catch(e){
    document.getElementById("qlistennote").textContent="⚠️ "+e.message;
  }finally{
    btn.disabled=false; btn.textContent="Generate";
  }
}

/* ---- AI STORY & COMPREHENSION (lesson tab) ---- */
const AIST={active:false,story:"",gloss:[],qs:[],qi:0,qok:0};
async function aiStory(){
  if(!aiReady()){ toast("Enable the AI tutor in ⚙️ Settings first (the free option needs no key) 🤖"); openSettings(); return; }
  document.getElementById("lessonmenu").style.display="none";
  document.getElementById("lessonplay").style.display="block";
  document.getElementById("lsteps").innerHTML=[0,1,2,3,4].map(i=>'<div class="lstep"><i></i></div>').join("");
  document.getElementById("lbody").innerHTML='<div class="lcard"><div style="font-size:40px;">🤖✨</div><div class="big" style="font-size:20px;">Writing your story…</div><p class="hint">using your AI key · '+LANGS[S.learn].name+'</p></div>';
  document.getElementById("lactions").innerHTML="";
  try{
    const sys='You are a language tutor writing graded reading. The user speaks '+LANGS[S.speak].name+' and is learning '+LANGS[S.learn].name+' (level A2-B1). Reply with ONLY valid JSON (no markdown): '
      + '{"story":"a short story of 5-7 simple sentences in '+LANGS[S.learn].name+' about everyday life (travel, food, family or weather)",'
      + '"gloss":[{"w":"key word or short phrase from the story, in '+LANGS[S.learn].name+'","m":"meaning in '+LANGS[S.speak].name+'"}] (exactly 3),'
      + '"questions":[{"q":"comprehension question in '+LANGS[S.learn].name+'","options":["a","b","c","d"],"answer":0}] (exactly 3; all options in '+LANGS[S.learn].name+', "answer" is the 0-based index)}';
    const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({provider:S.ai.provider,key:S.ai.key,model:S.ai.model,
        messages:[{role:"system",content:sys},{role:"user",content:"Write the story now."}],max_tokens:1300})});
    const j=await r.json();
    if(!j.ok) throw new Error(j.error||"AI request failed");
    let s=String(j.text).trim().replace(/^```(?:json)?/,"").replace(/```$/,"").trim();
    const a=s.indexOf("{"), b=s.lastIndexOf("}");
    if(a>=0&&b>a) s=s.slice(a,b+1);
    const o=JSON.parse(s);
    if(!o.story||!String(o.story).trim()) throw new Error("the AI returned no story");
    AIST.active=true;
    AIST.story=String(o.story).trim();
    AIST.gloss=(Array.isArray(o.gloss)?o.gloss:[]).slice(0,3).map(g=>({w:String(g.w||""),m:String(g.m||"")})).filter(g=>g.w);
    AIST.qs=(Array.isArray(o.questions)?o.questions:[])
      .map(q=>({q:String(q.q||"").trim(),options:(Array.isArray(q.options)?q.options:[]).map(String),answer:parseInt(q.answer,10)}))
      .filter(q=>q.q&&q.options.length>=2)
      .map(q=>{ q.answer=Math.max(0,Math.min(q.options.length-1,isNaN(q.answer)?0:q.answer)); return q; })
      .slice(0,3);
    AIST.qi=0; AIST.qok=0;
    addXp(2,"AI story read");
    aiStoryStep();
  }catch(e){
    document.getElementById("lbody").innerHTML='<div class="lcard"><div style="font-size:40px;">😅</div><div class="big" style="font-size:18px;">Story failed</div><p class="hint" style="margin-top:6px;">'+esc(e.message)+'</p></div>';
    document.getElementById("lactions").innerHTML='<button class="btn blue" id="astoryback">← Back to lessons</button>';
    document.getElementById("astoryback").onclick=aiStoryExit;
  }
}
function aiStoryExit(){
  AIST.active=false;
  document.getElementById("lessonplay").style.display="none";
  document.getElementById("lessonmenu").style.display="block";
  renderLessonCats();
}
function aiStoryStep(){
  const body=document.getElementById("lbody"), act=document.getElementById("lactions");
  const steps=document.getElementById("lsteps");
  const stage=AIST.qi===0?0:Math.min(4,AIST.qi);
  steps.innerHTML=[0,1,2,3,4].map(i=>'<div class="lstep '+(i<stage||(i===0&&AIST.qi>0)?"done":"")+'"><i></i></div>').join("");
  if(AIST.qi<AIST.qs.length){
    if(AIST.qi===0){
      body.innerHTML='<div class="lcard"><div class="hint" style="font-weight:800;">📖 READ THE STORY ('+LANGS[S.learn].name+')</div>'
        +'<div style="font-size:17px;text-align:left;line-height:1.75;margin:10px 0;">'+esc(AIST.story)+'</div>'
        +'<button class="mini" id="astorylisten" style="font-size:13px;padding:7px 14px;">🔊 Listen</button></div>'
        +(AIST.gloss.length?'<div class="lcard" style="text-align:left;"><div class="hint" style="font-weight:800;">✨ KEY WORDS</div>'
          +AIST.gloss.map(g=>'<div style="padding:5px 0;font-size:14.5px;"><b>'+esc(g.w)+'</b> — '+esc(g.m)+'</div>').join("")+'</div>':"");
      act.innerHTML='<button class="btn green big" id="astorynext">Got it → questions</button>';
      document.getElementById("astorylisten").onclick=()=>speak(AIST.story,S.learn);
      document.getElementById("astorynext").onclick=()=>{ AIST.qi=1; aiStoryStep(); };
    } else {
      const q=AIST.qs[AIST.qi-1];
      body.innerHTML='<div class="lcard"><div class="hint" style="font-weight:800;">❓ QUESTION '+(AIST.qi)+'/'+AIST.qs.length+'</div><div class="qword" style="font-size:19px;line-height:1.5;">'+esc(q.q)+'</div></div>'
        +'<div id="aistqopts" class="chips" style="flex-direction:column;align-items:stretch;"></div>';
      act.innerHTML='<button class="btn ghost" id="astoryquit">✕ Quit story</button>';
      document.getElementById("astoryquit").onclick=aiStoryExit;
      const box=document.getElementById("aistqopts");
      q.options.forEach((op,i)=>{
        const b=document.createElement("button"); b.className="qopt"; b.textContent=op;
        b.onclick=()=>{
          box.querySelectorAll(".qopt").forEach(x=>x.disabled=true);
          const ok=i===q.answer;
          box.querySelectorAll(".qopt")[q.answer].classList.add("correct");
          if(!ok) b.classList.add("wrong");
          if(ok){ AIST.qok++; addXp(2,"AI story quiz"); beep("good"); } else beep("bad");
          setTimeout(()=>{
            AIST.qi++;
            if(AIST.qi>=AIST.qs.length) aiStoryDone(); else aiStoryStep();
          },ok?700:1500);
        };
        box.appendChild(b);
      });
    }
  } else aiStoryDone();
}
function aiStoryDone(){
  document.getElementById("lsteps").innerHTML=[0,1,2,3,4].map(i=>'<div class="lstep done"><i></i></div>').join("");
  document.getElementById("lbody").innerHTML='<div class="lcard"><div style="font-size:44px;">🎉</div><div class="big">Story complete!</div>'
    +'<div class="hint" style="margin-top:6px;">Comprehension score: '+AIST.qok+'/'+AIST.qs.length+'</div></div>';
  document.getElementById("lactions").innerHTML='<button class="btn blue" id="astoryagain">📖 Another story</button><button class="btn ghost" id="astorydone">Done</button>';
  document.getElementById("astoryagain").onclick=()=>aiStory();
  document.getElementById("astorydone").onclick=()=>switchView("progress");
  addXp(5,"AI story complete");
}

/* ---- BACKUP / RESTORE ---- */
function exportBackup(){
  try{
    const data={app:"talkora",v:3,exported:new Date().toISOString(),state:S};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="talkora-backup-"+new Date().toISOString().slice(0,10)+".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),5000);
    toast("💾 Backup downloaded — keep it somewhere safe!");
  }catch(e){ toast("⚠️ Export failed: "+e.message); }
}
function importBackup(file){
  const rd=new FileReader();
  rd.onload=()=>{
    try{
      const o=JSON.parse(String(rd.result));
      const st=(o&&(o.app==="talkora"||o.app==="vazhakam")&&o.state)?o.state:(o&&typeof o.xp==="number")?o:null;
      if(!st) throw new Error("this file is not a Talkora backup");
      if(!confirm("Replace your current progress with this backup?\n(You can export your current state first.)")) return;
      localStorage.setItem(SKEY,JSON.stringify(Object.assign(sDefaults(),st)));
      location.reload();
    }catch(e){ alert("Import failed: "+e.message); }
  };
  rd.onerror=()=>alert("Could not read that file.");
  rd.readAsText(file);
}

/* ---- V3 BINDINGS ---- */
function initV3(){
  // words tab
  document.getElementById("wsearch").addEventListener("input",e=>{ wQuery=e.target.value; renderWords(); });
  // flashcards: new Good button
  document.getElementById("fgood").onclick=()=>fMark("good");
  // quiz modes
  document.getElementById("qunscbtn").onclick=()=>startQuiz("unscramble");
  document.getElementById("qclozebtn").onclick=()=>startQuiz("cloze");
  document.getElementById("qtypebtn").onclick=()=>{ if(!("speechSynthesis" in window)){ toast("Dictation needs speech synthesis — use Chrome/Edge 🎧"); return; } startQuiz("type"); };
  document.getElementById("aquizbtn").onclick=()=>aiQuiz(document.getElementById("aitopic").value);
  // lesson: AI story
  document.getElementById("astorybtn").onclick=aiStory;
  // shadowing
  document.getElementById("shnew").onclick=shNew;
  document.getElementById("shmicsay").onclick=()=>{
    if(!SR){ toast("Speech recognition not supported here — use Chrome/Edge 🎤"); return; }
    if(recBusy||!shPhrase) return;
    recBusy=true; setMic(true);
    rec=newRec(S.learn,{ text:t=>{ shScore(t); } },()=>{ rec=null; });
    try{ rec.start(); }catch(e){ recBusy=false; setMic(false); }
  };
  shNew();
  // chat: conversation + review
  document.getElementById("convbtn").onclick=toggleConv;
  if(S.convOn) document.getElementById("convbtn").textContent="🗣 Free conversation: ON";
  document.getElementById("reviewbtn").onclick=sessionReview;
  // settings
  document.getElementById("ailevsel").value=S.aiLevel||"b2";
  document.getElementById("ailevsel").onchange=()=>{ S.aiLevel=document.getElementById("ailevsel").value; save(); };
  document.getElementById("expbtn").onclick=exportBackup;
  document.getElementById("impbtn").onclick=()=>document.getElementById("impfile").click();
  document.getElementById("impfile").onchange=e=>{ const f=e.target.files&&e.target.files[0]; if(f) importBackup(f); e.target.value=""; };
}

/* ---------------- DIRECTION & TABS ---------------- */
function applyDirection(){
  if(S.learn===S.speak) S.learn=S.speak==="en"?"ta":"en";
  save();
  document.getElementById("selSpeak").value=S.speak;
  document.getElementById("selLearn").value=S.learn;
  document.getElementById("tfrom").textContent=LANGS[S.speak].name;
  document.getElementById("quizhint").textContent=LANGS[S.speak].name;
  chatlog.innerHTML=""; CHAT_HIST=[];
  lastBotText=""; lastBotLang=null;
  botGreet();
  pPhrase=null;
  renderWot(); refreshChips(); renderCatbar(); renderCard();
}
function switchView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("on"));
  document.querySelectorAll("#tabs button").forEach(b=>b.classList.toggle("on",b.getAttribute("data-view")===name));
  document.getElementById("view-"+name).classList.add("on");
  if(name==="progress") renderProgress();
  if(name==="bot") renderBotSeg();
  if(name==="script") renderScript();
  if(name==="grammar") renderGrammar();
  if(name==="cards"){ renderCatbar(); renderCard(); }
  if(name==="words") renderWords();
  if(name==="lesson"&&document.getElementById("lessonmenu").style.display!=="none") renderLessonCats();
  if(name==="quiz"){
    if(!SR) document.getElementById("qlistennote").textContent="⚠️ Listening quiz needs speech synthesis + recognition — use Chrome/Edge.";
    else document.getElementById("qlistennote").textContent="👂 Headphones recommended for the listening quiz!";
  }
  if(name==="speak"){
    document.getElementById("prlang").textContent=LANGS[S.learn].name;
    if(!pPhrase) pNewPhrase();
    if(!SR) document.getElementById("primicnote").textContent="⚠️ Speech recognition not supported in this browser — use Chrome/Edge for voice scoring.";
    else document.getElementById("primicnote").textContent="";
  }
}
function refreshChips(){
  const q=document.getElementById("quick");
  q.innerHTML="";
  QUICK_IDS.forEach(id=>{
    const e=BYID[id]; if(!e) return;
    const b=document.createElement("button");
    b.className="chip";
    b.textContent=T(e,S.speak);
    b.title="Tap to send";
    b.onclick=()=>handleUserText(T(e,S.speak));
    q.appendChild(b);
  });
}

/* ---------------- SETTINGS ---------------- */
function openSettings(){
  document.getElementById("ai-on").checked=!!S.ai.on;
  document.getElementById("ai-provider").value=S.ai.provider;
  const _free=S.ai.provider==="pollinations";
  const _fn=document.getElementById("ai-freenote"); if(_fn) _fn.style.display=_free?"block":"none";
  const _k=document.getElementById("ai-key"); if(_k) _k.placeholder=_free?"not needed for the free provider":"sk-...";
  const _m=document.getElementById("ai-model"); if(_m){ _m.disabled=_free; _m.placeholder=_free?"gpt-oss-20b (fixed)":"auto"; if(_free) _m.value=""; }
  document.getElementById("ai-model").value=S.ai.model||"";
  document.getElementById("ai-key").value=S.ai.key||"";
  document.getElementById("ailevsel").value=S.aiLevel||"b2";
  document.getElementById("goal-sel").value=String(S.goal);
  document.getElementById("rate-sel").value=S.rate;
  document.getElementById("rate-val").textContent=(+S.rate).toFixed(2).replace(/0$/,"");
  document.getElementById("sound-sel").checked=!!S.sound;
  document.getElementById("dark-sel").checked=!!S.dark;
  document.getElementById("settingsmodal").classList.add("on");
}
function bindSettings(){
  document.getElementById("settingsbtn").onclick=openSettings;
  document.getElementById("settingsclose").onclick=()=>document.getElementById("settingsmodal").classList.remove("on");
  document.getElementById("settingsmodal").addEventListener("click",e=>{ if(e.target.id==="settingsmodal") e.target.classList.remove("on"); });
  const onAI=()=>{ S.ai.on=document.getElementById("ai-on").checked; save(); updateAiBadge(); };
  document.getElementById("ai-on").onchange=onAI;
  function syncFreeNote(){
    const free=S.ai.provider==="pollinations";
    const n=document.getElementById("ai-freenote"); if(n) n.style.display=free?"block":"none";
    const k=document.getElementById("ai-key"); if(k) k.placeholder=free?"not needed for the free provider":"sk-...";
    const m=document.getElementById("ai-model"); if(m){ m.disabled=free; m.placeholder=free?"gpt-oss-20b (fixed)":"auto"; if(free) m.value=""; }
  }
  document.getElementById("ai-provider").onchange=()=>{
    S.ai.provider=document.getElementById("ai-provider").value;
    const defs={openai:"gpt-4o-mini",anthropic:"claude-3-5-haiku-latest",gemini:"gemini-2.0-flash",pollinations:"gpt-oss-20b (fixed)"};
    document.getElementById("ai-model").placeholder=defs[S.ai.provider]||"";
    syncFreeNote(); save(); onAI();
  };
  document.getElementById("ai-model").oninput=()=>{ S.ai.model=document.getElementById("ai-model").value.trim(); save(); };
  document.getElementById("ai-key").oninput=()=>{ S.ai.key=document.getElementById("ai-key").value.trim(); save(); onAI(); };
  document.getElementById("goal-sel").onchange=()=>{ S.goal=+document.getElementById("goal-sel").value; S.today={date:todayStr(),xp:S.today.xp}; save(); renderProgress(); };
  document.getElementById("rate-sel").oninput=function(){ S.rate=+this.value; document.getElementById("rate-val").textContent=S.rate.toFixed(2).replace(/0$/,""); save(); };
  document.getElementById("sound-sel").onchange=()=>{ S.sound=document.getElementById("sound-sel").checked; save(); };
  document.getElementById("dark-sel").onchange=()=>{ S.dark=document.getElementById("dark-sel").checked; save(); applyDark(); };
}
function aiReady(){ return S.ai.on && (S.ai.provider==="pollinations" || !!S.ai.key); }
function updateAiBadge(){
  const b=document.getElementById("aibadge");
  if(aiReady()){
    b.className="ai-badge on";
    const model=S.ai.provider==="pollinations"?"free · gpt-oss-20b":(S.ai.model||{openai:"gpt-4o-mini",anthropic:"haiku",gemini:"2.0-flash"}[S.ai.provider]);
    b.textContent="🤖 AI tutor: ON ("+model+")";
  } else {
    b.className="ai-badge off";
    b.textContent=S.ai.on?"🤖 AI on — add key in ⚙️ (free option needs none)":"🤖 Offline tutor";
  }
}
function applyDark(){ document.body.classList.toggle("dark",!!S.dark); }


/* ---------------- LIVE BOT (interactive voice coach) ---------------- */
S.bot=S.bot||{mode:"speak",auto:false,voice:true};
const BOT={busy:false,rec:null};
function botMicBtn(){ return document.getElementById("botmic"); }
function renderBotSeg(){
  const X=LANGS[S.speak],Y=LANGS[S.learn];
  const bx=document.querySelector("#botseg [data-mode='speak']"),by=document.querySelector("#botseg [data-mode='learn']");
  if(bx){ bx.innerHTML="🗣 Speak "+esc(X.name); bx.classList.toggle("on",S.bot.mode==="speak"); }
  if(by){ by.innerHTML="🎯 Try "+esc(Y.name); by.classList.toggle("on",S.bot.mode==="learn"); }
  const h=document.getElementById("bothint");
  if(h) h.innerHTML = S.bot.mode==="speak"
    ? "Speak in <b>"+esc(X.name)+"</b> — I translate it and say it out loud in <b>"+esc(Y.name)+"</b>. Then try repeating it!"
    : "Speak in <b>"+esc(Y.name)+"</b> — I listen, and if something is wrong I correct you <b>through voice</b>.";
  const a=document.getElementById("botauto"); if(a) a.textContent="🔁 Auto-listen: "+(S.bot.auto?"ON":"OFF");
  const v=document.getElementById("botvoice"); if(v) v.textContent="🔊 Voice replies: "+(S.bot.voice?"ON":"OFF");
}
function botStat(html){ const s=document.getElementById("botstat"); if(s) s.innerHTML=html; }
function botRow(cls,html){
  const log=document.getElementById("botlog"); if(!log) return;
  const e=document.getElementById("botempty"); if(e) e.style.display="none";
  const d=document.createElement("div"); d.className="brow "+cls; d.innerHTML=html; log.appendChild(d);
  while(log.children.length>40) log.removeChild(log.firstChild);
}
function botRelisten(delay){
  if(S.bot.auto) setTimeout(()=>{ if(S.bot.auto&&!BOT.busy&&!(window.speechSynthesis&&window.speechSynthesis.speaking)) botListen(); },delay||500);
}
function botListen(){
  if(!SR){ toast("🎤 Voice input needs Chrome or Edge — Chat & Translate still work by typing."); return; }
  const mb=botMicBtn();
  if(BOT.busy&&BOT.rec){ try{BOT.rec.stop();}catch(e){} return; }
  if(BOT.busy) return;
  if(window.speechSynthesis) window.speechSynthesis.cancel();
  BOT.busy=true;
  const lang=S.bot.mode==="learn"?S.learn:S.speak;
  if(mb) mb.classList.add("rec");
  const ava=document.getElementById("botava"); if(ava) ava.classList.add("listening");
  botStat("🎧 Listening in <b>"+esc(LANGS[lang].name)+"</b>… speak now");
  BOT.rec=newRec(lang,
    { interim:t=>{ const i=document.getElementById("botinterim"); if(i) i.textContent="“"+t+"”"; },
      text:t=>{ botHeard(t,lang); } },
    ()=>{ if(mb) mb.classList.remove("rec");
          const ava2=document.getElementById("botava"); if(ava2) ava2.classList.remove("listening");
          const i=document.getElementById("botinterim"); if(i) i.textContent="";
          BOT.rec=null;
          if(!BOT.busy) botStat("🤖 Tap the mic when ready");
    });
  if(!BOT.rec){ BOT.busy=false; if(mb) mb.classList.remove("rec"); return; }
  try{ BOT.rec.start(); }catch(e){ BOT.busy=false; if(mb) mb.classList.remove("rec"); }
}
async function botHeard(text,lang){
  BOT.busy=true;
  botRow("user",'<span class="tag2">You · '+esc(LANGS[lang].name)+'</span><div class="bub">'+esc(text)+'</div>');
  BOT.n.turns++; botScore();
  if(lang===S.speak) await botTranslate(text); else await botCorrect(text);
  BOT.busy=false;
  botStat("🤖 "+(S.bot.auto?"Listening again soon…":"Tap the mic when ready"));
  botRelisten(600);
}
async function botTranslate(text){
  botStat("🧠 Translating <span class=\"dots\"><i></i><i></i><i></i></span>");
  const from=S.speak,to=S.learn;
  let out=null;
  const exact=PHRASEMAPS[from]&&PHRASEMAPS[from].get(norm(text));
  if(exact) out=T(exact,to);
  if(!out){
    try{
      const r=await fetch("/api/translate?q="+encodeURIComponent(text)+"&from="+from+"&to="+to);
      const j=await r.json(); if(j&&j.ok&&j.text) out=j.text;
    }catch(e){}
  }
  if(!out){
    botRow("bot",'<span class="tag2">Talkora</span><div class="bub">⚠️ I couldn\'t translate that right now — try a simpler phrase, or check your connection.</div>');
    return;
  }
  addXp(2,"live bot");
  BOT.lastAn=out;
  botRow("bot",'<span class="tag2">Talkora · '+esc(LANGS[to].name)+'</span><div class="bub">🌐 '+esc(out)+'</div>'+
    '<div class="fix"><div class="lbl">🎯 Now you try</div>Say it in '+esc(LANGS[to].name)+' — switch to 🎯 Try and tap the mic!</div>'+
    '<div style="display:flex;gap:6px;margin-top:8px;"><button class="mini" data-bact="hearan">🔁 Hear again</button><button class="mini" data-bact="try">🎯 I\'ll try now</button></div>');
  S.bot.mode="learn"; renderBotSeg(); save();
  const after=()=>botStat("🎯 Your turn — say it in <b>"+esc(LANGS[to].name)+"</b>");
  if(S.bot.voice) speak(out,to,undefined,after); else after();
}
async function botCorrect(text){
  botStat("🧠 Checking your "+esc(LANGS[S.learn].name)+" <span class=\"dots\"><i></i><i></i><i></i></span>");
  const X=LANGS[S.speak],Y=LANGS[S.learn];
  if(aiReady()){
    try{
      const sys=[
        "You are \"Talkora\", an encouraging speaking coach.",
        "The learner's native language is "+X.name+". They just tried speaking in "+Y.name+". The speech recogniser heard: \""+text+"\".",
        "Judge grammar and word choice of what they most likely intended; ignore pure recognition artifacts.",
        "Reply with ONLY valid JSON (no markdown): {\"perfect\":true|false,\"corrected\":\"...\",\"tip\":\"...\",\"praise\":\"...\"}",
        "- corrected: the natural correct sentence in "+Y.name+" (short).",
        "- tip: ONE brief coaching tip in "+X.name+" (max 10 words); empty string if perfect.",
        "- praise: short cheerful praise in "+Y.name+".",
      ].join("\n");
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({provider:S.ai.provider,key:S.ai.key,model:S.ai.model,
          messages:[{role:"system",content:sys},{role:"user",content:text}],max_tokens:300})});
      const j=await r.json();
      if(!j.ok) throw new Error(j.error||"AI failed");
      let s=String(j.text).trim().replace(/^```(?:json)?/,"").replace(/```$/,"").trim();
      const a=s.indexOf("{"),b=s.lastIndexOf("}"); if(a>=0&&b>a) s=s.slice(a,b+1);
      const o=JSON.parse(s);
      const corrected=String(o.corrected||text).slice(0,300), tip=String(o.tip||""), praise=String(o.praise||"Great job!");
      const perfect=!!o.perfect;
      addXp(perfect?5:3,"live bot");
      const line=perfect?(praise+" "+corrected):("Almost! Say it like this: "+corrected);
      BOT.lastSay=line; if(perfect) BOT.n.perfect++; else BOT.n.fixed++; botScore();
      botRow("bot",'<span class="tag2">Talkora · coach</span><div class="bub">'+(perfect?"✅ ":"🛠️ ")+esc(line)+'</div>'+
        (tip&&!perfect?'<div class="fix"><div class="lbl">💡 Tip · '+esc(X.name)+'</div>'+esc(tip)+'</div>':'')+
        '<div style="display:flex;gap:6px;margin-top:8px;"><button class="mini" data-bact="hear">🔁 Hear again</button></div>');
      if(S.bot.voice) speak(line,S.learn,undefined,()=>botStat("🤖 "+(S.bot.auto?"Listening again soon…":"Tap the mic when ready")));
      return;
    }catch(e){ /* offline fallback below */ }
  }
  const hit=PHRASEMAPS[S.learn]&&PHRASEMAPS[S.learn].get(norm(text));
  if(hit){
    const say=T(hit,S.learn);
    addXp(3,"live bot"); BOT.n.perfect++; botScore();
    botRow("bot",'<span class="tag2">Talkora · coach</span><div class="bub">✅ Perfect! '+esc(say)+'</div>');
    if(S.bot.voice) speak("Perfect! "+say,S.learn);
  }else{
    botRow("bot",'<span class="tag2">Talkora</span><div class="bub">🎧 I heard you! For out-loud corrections, enable the free AI Coach in ⚙️ Settings.</div>');
    if(S.bot.voice) speak("I heard you! Keep practicing.",S.learn);
  }
}
function initBot(){
  const mb=botMicBtn();
  if(mb) mb.onclick=()=>botListen();
  document.querySelectorAll("#botseg button").forEach(b=>{
    b.onclick=()=>{ S.bot.mode=b.getAttribute("data-mode"); save(); renderBotSeg(); };
  });
  const a=document.getElementById("botauto");
  if(a) a.onclick=()=>{ S.bot.auto=!S.bot.auto; save(); renderBotSeg(); if(S.bot.auto&&!BOT.busy) botListen(); };
  const v=document.getElementById("botvoice");
  if(v) v.onclick=()=>{ S.bot.voice=!S.bot.voice; save(); renderBotSeg(); };
  const c=document.getElementById("botclear");
  if(c) c.onclick=()=>{ const l=document.getElementById("botlog"); if(l) l.innerHTML=""; const e=document.getElementById("botempty"); if(e) e.style.display=""; };
  const sS=document.getElementById("selSpeak"),sL=document.getElementById("selLearn");
  if(sS) sS.addEventListener("change",renderBotSeg);
  if(sL) sL.addEventListener("change",renderBotSeg);
  renderBotSeg();
}
document.addEventListener("DOMContentLoaded",initBot);


/* ---------------- SCRIPT TRAINER ---------------- */
const SCRIPTS={
  ta:{name:"Tamil · தமிழ்",groups:[
    ["Vowels · உயிர்",[
      ["அ","a","short a, like 'u' in cup"],
      ["ஆ","aa","long aa, like 'a' in father"],
      ["இ","i","short i, like 'i' in bit"],
      ["ஈ","ee","long ee, like 'ee' in see"],
      ["உ","u","short u, like 'u' in put"],
      ["ஊ","oo","long oo, like 'oo' in boot"],
      ["எ","e","short e, like 'e' in bed"],
      ["ஏ","ay","long ay, like 'a' in cake"],
      ["ஐ","ai","ai, like 'i' in ice"],
      ["ஒ","o","short o, like 'o' in cot"],
      ["ஓ","oh","long oh, like 'o' in bone"],
      ["ஔ","au","au, like 'ou' in out"]]],
    ["Consonants · மெய்",[
      ["க","ka","ka"],
      ["ங","nga","nga, like 'ng' in song"],
      ["ச","cha","cha"],
      ["ஞ","nya","nya, like 'ni' in onion"],
      ["ட","ta","hard ta (retroflex, no breath)"],
      ["ண","na","retroflex na (tongue curled)"],
      ["த","tha","soft tha, like English 'th' in this"],
      ["ந","na","dental na"],
      ["ப","pa","pa"],
      ["ம","ma","ma"],
      ["ய","ya","ya"],
      ["ர","ra","ra (single trill)"],
      ["ல","la","la"],
      ["வ","va","va / wa"],
      ["ழ","zha","zha — the classic Tamil buzz (like 'bird' in US English)"],
      ["ள","la","retroflex la (deeper l)"],
      ["ற","ra","strong ra (trilled rr)"],
      ["ன","na","alveolar na"]]],
    ["Special",[
      ["ஃ","akh","aytham — rare standalone dot sound"]]]]},
  hi:{name:"Hindi · देवनागरी",groups:[
    ["Vowels · स्वर",[
      ["अ","a","short a, like 'u' in cup"],
      ["आ","aa","long aa, like 'a' in father"],
      ["इ","i","short i, like 'i' in bit"],
      ["ई","ee","long ee, like 'ee' in see"],
      ["उ","u","short u, like 'u' in put"],
      ["ऊ","oo","long oo, like 'oo' in boot"],
      ["ए","e","ay, like 'a' in cake"],
      ["ऐ","ai","ai, like 'i' in ice"],
      ["ओ","o","oh, like 'o' in bone"],
      ["औ","au","au, like 'ou' in out"]]],
    ["Consonants · व्यंजन",[
      ["क","ka","ka"],
      ["ख","kha","kha — k with a puff of air"],
      ["ग","ga","ga"],
      ["घ","gha","gha — g with a puff"],
      ["ङ","nga","nga, like 'ng' in song"],
      ["च","cha","cha"],
      ["छ","chha","chha — ch with a puff"],
      ["ज","ja","ja"],
      ["झ","jha","jha — j with a puff"],
      ["ट","ta","retroflex ta (tongue curled)"],
      ["ठ","tha","retroflex tha with puff"],
      ["ड","da","retroflex da"],
      ["ढ","dha","retroflex dha with puff"],
      ["ण","na","retroflex na"],
      ["त","ta","dental ta (soft, no puff)"],
      ["थ","tha","dental ta WITH puff (not 'th'!)"],
      ["द","da","dental da"],
      ["ध","dha","dental dha with puff"],
      ["न","na","na"],
      ["प","pa","pa"],
      ["फ","pha","pha — p with a puff (like 'ph' in phone)"],
      ["ब","ba","ba"],
      ["भ","bha","bha — b with a puff"],
      ["म","ma","ma"],
      ["य","ya","ya"],
      ["र","ra","ra"],
      ["ल","la","la"],
      ["व","va","va / wa"],
      ["श","sha","sha, like 'sh' in ship"],
      ["ष","sha","retroflex sha"],
      ["स","sa","sa"],
      ["ह","ha","ha"]]]]},
  ml:{name:"Malayalam · മലയാളം",groups:[
    ["Vowels · സ്വരം",[
      ["അ","a","short a, like 'u' in cup"],
      ["ആ","aa","long aa, like 'a' in father"],
      ["ഇ","i","short i, like 'i' in bit"],
      ["ഈ","ee","long ee, like 'ee' in see"],
      ["ഉ","u","short u, like 'u' in put"],
      ["ഊ","oo","long oo, like 'oo' in boot"],
      ["എ","e","short e, like 'e' in bed"],
      ["ഏ","ay","long ay, like 'a' in cake"],
      ["ഐ","ai","ai, like 'i' in ice"],
      ["ഒ","o","short o, like 'o' in cot"],
      ["ഓ","oh","long oh, like 'o' in bone"],
      ["ഔ","au","au, like 'ou' in out"]]],
    ["Consonants · വ്യഞ്ജനം",[
      ["ക","ka","ka"],
      ["ഖ","kha","kha — k with a puff"],
      ["ഗ","ga","ga"],
      ["ഘ","gha","gha — g with a puff"],
      ["ങ","nga","nga, like 'ng' in song"],
      ["ച","cha","cha"],
      ["ജ","ja","ja"],
      ["ഞ","nya","nya, like 'ni' in onion"],
      ["ട","ta","retroflex ta (tongue curled)"],
      ["ഠ","tha","retroflex tha with puff"],
      ["ഡ","da","retroflex da"],
      ["ഢ","dha","retroflex dha with puff"],
      ["ണ","na","retroflex na"],
      ["ത","tha","dental tha, soft like 'th' in this"],
      ["ദ","da","dental da"],
      ["ധ","dha","dental dha with puff"],
      ["ന","na","na"],
      ["പ","pa","pa"],
      ["ഫ","pha","pha — p with a puff"],
      ["ബ","ba","ba"],
      ["ഭ","bha","bha — b with a puff"],
      ["മ","ma","ma"],
      ["യ","ya","ya"],
      ["ര","ra","ra"],
      ["ല","la","la"],
      ["വ","va","va / wa"],
      ["ശ","sha","sha, like 'sh' in ship"],
      ["ഷ","sha","retroflex sha"],
      ["സ","sa","sa"],
      ["ഹ","ha","ha"],
      ["ള","la","retroflex la (deeper l)"],
      ["ഴ","zha","zha — the buzz, like Tamil ழ"],
      ["റ","ra","strong ra (trilled rr)"]]]]}
};
S.scrKnown=S.scrKnown||{ta:[],hi:[],ml:[]};
S.scrScript=S.scrScript||((SCRIPTS[S.learn])?S.learn:"ta");
const SCR={group:0,cur:-1,script:S.scrScript};
const SCQ={on:false,items:[],i:0,score:0,locked:false};
function scrAll(code){ const out=[]; SCRIPTS[code].groups.forEach(g=>g[1].forEach(l=>out.push(l))); return out; }
function scrKnownList(){ return S.scrKnown[SCR.script]||(S.scrKnown[SCR.script]=[]); }
function renderScript(){
  if(!SCRIPTS[SCR.script]) SCR.script="ta";
  SCQ.on=false;
  const qz=document.getElementById("scrquiz"); if(qz) qz.style.display="none";
  const bar=document.getElementById("scrbar");
  if(bar){ let h=""; Object.keys(SCRIPTS).forEach(c=>{
      const on=SCR.script===c;
      h+='<button class="chip" style="'+(on?"border-color:var(--orange);color:var(--orange-dark);background:#fff4ec;":"")+'" data-scr="'+c+'">'+SCRIPTS[c].name+'</button>';
    }); bar.innerHTML=h;
    bar.querySelectorAll("button").forEach(b=>b.onclick=()=>{ SCR.script=b.getAttribute("data-scr"); SCR.group=0; SCR.cur=-1; S.scrScript=SCR.script; save(); renderScript(); });
  }
  const grp=document.getElementById("scrgrp");
  if(grp){ let h=""; SCRIPTS[SCR.script].groups.forEach((g,i)=>{
      h+='<button class="chip" style="'+(SCR.group===i?"border-color:var(--teal);color:var(--teal-dark);background:#e9fbf8;":"")+'" data-g="'+i+'">'+g[0]+'</button>';
    }); grp.innerHTML=h;
    grp.querySelectorAll("button").forEach(b=>b.onclick=()=>{ SCR.group=+b.getAttribute("data-g"); SCR.cur=-1; renderScript(); });
  }
  const all=scrAll(SCR.script), known=scrKnownList();
  const cnt=document.getElementById("scrcount");
  if(cnt) cnt.innerHTML="✍️ <b>"+known.length+"</b>/"+all.length+" letters known";
  const grid=document.getElementById("scrgrid");
  if(grid){ let h=""; SCRIPTS[SCR.script].groups[SCR.group][1].forEach((l,i)=>{
      const k=known.includes(l[0]);
      h+='<button class="stile'+(k?" known":"")+(SCR.cur===i?" cur":"")+'" data-i="'+i+'"><span class="g">'+l[0]+'</span><span class="t">'+esc(l[1])+(k?" ✓":"")+'</span></button>';
    }); grid.innerHTML=h;
    grid.querySelectorAll(".stile").forEach(b=>b.onclick=()=>{ SCR.cur=+b.getAttribute("data-i"); renderScriptDetail(); renderScriptKeepGrid(); });
  }
  renderScriptDetail();
}
function renderScriptKeepGrid(){
  const grid=document.getElementById("scrgrid");
  if(grid) grid.querySelectorAll(".stile").forEach((b,i)=>b.classList.toggle("cur",i===SCR.cur));
}
function renderScriptDetail(){
  const d=document.getElementById("scrdetail"); if(!d) return;
  const letters=SCRIPTS[SCR.script].groups[SCR.group][1];
  if(SCR.cur<0||SCR.cur>=letters.length){ d.style.display="none"; return; }
  const l=letters[SCR.cur], known=scrKnownList().includes(l[0]);
  d.style.display="flex";
  d.innerHTML='<div class="big">'+l[0]+'</div><div class="grow"><div class="nm">'+esc(l[1])+'</div><div class="ht">'+esc(l[2])+'</div></div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;">'+
    '<button class="btn blue" id="scrhear">🔊 Hear</button>'+
    '<button class="btn '+(known?"ghost":"green")+'" id="scrknow">'+(known?"✓ Known":"Mark known")+'</button>'+
    '<button class="mini" id="scrnext">Next →</button></div>';
  const h=document.getElementById("scrhear"); if(h) h.onclick=()=>speak(l[0],SCR.script);
  const k=document.getElementById("scrknow"); if(k) k.onclick=()=>{
    const list=scrKnownList(); const ix=list.indexOf(l[0]);
    if(ix>=0) list.splice(ix,1); else { list.push(l[0]); addXp(1,"letters"); }
    save(); renderScript(); SCR.cur=letters.indexOf(l); renderScriptKeepGrid();
  };
  const n=document.getElementById("scrnext"); if(n) n.onclick=()=>{ SCR.cur=(SCR.cur+1)%letters.length; renderScriptDetail(); renderScriptKeepGrid(); };
}
function scrQueueSpeak(texts,lang,i){
  if(i>=texts.length) return;
  speak(texts[i],lang,undefined,()=>setTimeout(()=>scrQueueSpeak(texts,lang,i+1),250));
}
function scriptQuiz(){
  const box=document.getElementById("scrquiz"); if(!box) return;
  const all=scrAll(SCR.script);
  const pool=shuffle(all.slice()).slice(0,5);
  SCQ.on=true; SCQ.items=pool.map(l=>{
    const wrong=shuffle(all.filter(x=>x[0]!==l[0])).slice(0,3).map(x=>x[1]);
    return { glyph:l[0], answer:l[1], opts:shuffle([l[1]].concat(wrong)) };
  });
  SCQ.i=0; SCQ.score=0; SCQ.locked=false;
  box.style.display="block";
  renderScq();
}
function renderScq(){
  const box=document.getElementById("scrquiz"); if(!box) return;
  if(SCQ.i>=SCQ.items.length){
    const n=SCQ.score;
    box.innerHTML='<div class="qresult"><div class="big">'+(n>=4?"🏆":n>=2?"🎉":"💪")+'</div><div class="n">'+n+'/'+SCQ.items.length+'</div>'+
      '<div class="hint">'+(n>=4?"Script master! Amazing.":n>=2?"Great — those letters are sticking!":"Good start — tap letters above to hear them again.")+'</div>'+
      '<button class="btn ghost" style="margin-top:10px;" id="scqagain">🔁 Play again</button></div>';
    const a=document.getElementById("scqagain"); if(a) a.onclick=scriptQuiz;
    return;
  }
  const q=SCQ.items[SCQ.i]; SCQ.locked=false;
  box.innerHTML='<div class="qhead"><span class="hint">Letter '+(SCQ.i+1)+'/'+SCQ.items.length+' · score '+SCQ.score+'</span></div>'+
    '<div class="qword" style="font-size:44px;text-align:center;">'+q.glyph+'</div>'+
    '<div class="hint" style="text-align:center;margin-bottom:6px;">Which sound is this?</div>'+
    q.opts.map((o,i)=>'<button class="qopt" data-o="'+i+'">'+esc(o)+'</button>').join("");
  box.querySelectorAll(".qopt").forEach(b=>b.onclick=()=>{
    if(SCQ.locked) return; SCQ.locked=true;
    const pick=b.getAttribute("data-o"); const val=q.opts[+pick];
    box.querySelectorAll(".qopt").forEach(x=>{
      if(x.innerHTML===esc(q.answer)) x.classList.add("correct");
    });
    if(val===q.answer){ SCQ.score++; addXp(2,"letter quiz"); beep&&beep("good"); }
    else { b.classList.add("wrong"); }
    setTimeout(()=>{ SCQ.i++; renderScq(); },900);
  });
}
function initScript(){
  SCR.script=S.scrScript&&SCRIPTS[S.scrScript]?S.scrScript:"ta";
  const q=document.getElementById("scrquizbtn"); if(q) q.onclick=scriptQuiz;
  const ha=document.getElementById("scrhearall"); if(ha) ha.onclick=()=>{
    scrQueueSpeak(SCRIPTS[SCR.script].groups[SCR.group][1].map(l=>l[0]),SCR.script,0);
  };
}
document.addEventListener("DOMContentLoaded",initScript);


/* ---------------- GRAMMAR GUIDE ---------------- */
const GRAMMAR={
  en:[["Word order","Subject → Verb → Object. Adjectives go before the noun.","She eats hot rice."],
      ["Nouns","No grammatical gender. Plurals usually add -s. Articles: a / an / the.","one book → two books"],
      ["Verbs & tenses","Time is shown by helper words: go / went / will go / have gone. Third person adds -s.","I eat · she eats · they ate"],
      ["Questions & politeness","Questions use do / is helpers. Soften requests with please and could you…?","Could you help me, please?"]],
  ta:[["Word order","Subject → Object → Verb — the verb always comes last.","அவள் சாப்பிடுகிறாள் (she eats)"],
      ["Nouns","No articles and no gender in verbs. Plural: -கள். Always prefer the polite நீங்கள்.","புத்தகங்கள் (books)"],
      ["Verbs","Endings carry person and number; there is no separate word for 'to be'. Present tense: -கிற-.","நான் போகிறேன் (I go)"],
      ["Questions","Just add the -ஆ ending to the verb — word order stays the same.","நீ வருகிறாயா? (are you coming?)"]],
  hi:[["Word order","Subject → Object → Verb; the verb closes the sentence.","वह चावल खाती है (she eats rice)"],
      ["Gender","Nouns are masculine or feminine, and verbs and adjectives agree with them.","लड़का जाता है · लड़की जाती है"],
      ["Verbs","Habitual present: -ता / -ती / -ते. Future adds -गा / -गी. Use the respectful आप.","मैं जाता हूँ (I go)"],
      ["Questions","No inversion — add क्या or simply raise your intonation.","क्या आप चाय पियेंगे? (will you have tea?)"]],
  ml:[["Word order","Subject → Object → Verb; describing words come before what they describe.","അവൾ ചോറ് കഴിക്കുന്നു (she eats rice)"],
      ["Nouns","No gender. Plural: -കൾ (or -മാർ for people). Polite you: നിങ്ങൾ.","പുസ്തകങ്ങൾ (books)"],
      ["Verbs","Present ends in -ുന്നു, the verb sits last, and no 'to be' is needed.","ഞാൻ പോകുന്നു (I go)"],
      ["Questions","Add the -ോ ending (or ആണോ) — the order of words never changes.","നിങ്ങൾ വരുന്നുണ്ടോ? (are you coming?)"]],
  fr:[["Word order","Subject → Verb → Object; adjectives usually come after the noun.","Elle mange du riz (she eats rice)"],
      ["Gender","Every noun is le (masc) or la (fem); plurals add a silent -s.","le livre · la table · les livres"],
      ["Verbs","Endings change with the person; past tenses use an avoir / être helper.","je mange · nous mangeons · j'ai mangé"],
      ["Questions","Three styles: rising tone, est-ce que, or inversion. Use vous with strangers.","Est-ce que tu parles anglais ?"]]
};
S.grLang=S.grLang||S.learn;
function renderGrammar(){
  if(!GRAMMAR[S.grLang]) S.grLang=S.learn&&GRAMMAR[S.learn]?S.learn:"en";
  const bar=document.getElementById("grbar");
  if(bar){ let h=""; Object.keys(GRAMMAR).forEach(c=>{
      h+='<button class="chip" style="'+(S.grLang===c?"border-color:var(--orange);color:var(--orange-dark);background:#fff4ec;":"")+'" data-g="'+c+'">'+LANGS[c].native+" · "+LANGS[c].name+'</button>';
    }); bar.innerHTML=h;
    bar.querySelectorAll("button").forEach(b=>b.onclick=()=>{ S.grLang=b.getAttribute("data-g"); save(); renderGrammar(); });
  }
  const body=document.getElementById("grbody");
  if(body){ body.innerHTML=GRAMMAR[S.grLang].map((s,i)=>
    '<div class="gsec"><h4>'+(i+1)+'. '+esc(s[0])+'</h4><p>'+esc(s[1])+'</p>'+
    '<div class="gex"><span style="flex:1;">'+esc(s[2])+'</span><button class="mini" data-gx="'+i+'">🔊</button></div></div>').join("");
    body.querySelectorAll("[data-gx]").forEach(b=>b.onclick=()=>{
      speak(GRAMMAR[S.grLang][+b.getAttribute("data-gx")][2].replace(/\(.*?\)/g,""),S.grLang);
    });
  }
}

/* ---------------- ONBOARDING TOUR ---------------- */
const TOUR=[
  {ic:"🗣",t:"Pick your pair",x:"The top selectors choose what you speak and what you're learning — any pair between 5 languages."},
  {ic:"🎙",t:"Talk, don't type",x:"The big mic listens to you. In Live Bot it even translates your speech and corrects mistakes out loud."},
  {ic:"🎮",t:"11 ways to practice",x:"Chat, Live Bot, Translate, Cards, Quiz, Lesson, Say It, Script, Grammar, Words, Progress — swipe the tab bar."},
  {ic:"🤖",t:"Free AI, zero keys",x:"The AI tutor runs on a free keyless provider by default. ⚙️ Settings lets you tune speed, voice and AI."},
  {ic:"📱",t:"Install Talkora",x:"Add it to your home screen — it opens full-screen like a native app and works offline."}
];
let TOUR_I=0;
function tourStart(){
  if(S.tourDone||document.getElementById("tourbg")) return;
  TOUR_I=0;
  const bg=document.createElement("div"); bg.id="tourbg"; bg.className="tourbg";
  document.body.appendChild(bg);
  tourRender();
}
function tourRender(){
  const bg=document.getElementById("tourbg"); if(!bg) return;
  const s=TOUR[TOUR_I];
  bg.innerHTML='<div class="tourcard"><div class="tic">'+s.ic+'</div><h3>'+esc(s.t)+'</h3><p>'+esc(s.x)+'</p>'+
    '<div class="tourdots">'+TOUR.map((_,i)=>'<i class="'+(i===TOUR_I?"on":"")+'"></i>').join("")+'</div>'+
    '<div class="tourbtns"><button class="btn ghost" id="tourskip">Skip</button>'+
    '<button class="btn blue" id="tournext">'+(TOUR_I===TOUR.length-1?"Let's go! 🚀":"Next →")+'</button></div>';
  document.getElementById("tourskip").onclick=tourEnd;
  document.getElementById("tournext").onclick=()=>{ if(TOUR_I>=TOUR.length-1) tourEnd(); else { TOUR_I++; tourRender(); } };
}
function tourEnd(){ const bg=document.getElementById("tourbg"); if(bg) bg.remove(); S.tourDone=1; save(); }

/* ---------------- SHARE PROGRESS + NUDGE + REMINDER ---------------- */
function shareProgress(){
  renderProgress();
  const g=id=>{ const e=document.getElementById(id); return e?e.textContent:""; };
  const badges=Object.keys(S.badges||{}).length;
  const txt="🗣️ Talkora check-in!\n🏅 Level "+g("st-level")+" · "+S.xp+" XP\n🔥 "+S.streak+"-day streak\n📚 "+g("st-known")+" words known · "+badges+" badges\nI'm learning "+LANGS[S.learn].name+" with my voice — free & offline!";
  if(navigator.share){ navigator.share({text:txt}).catch(()=>{}); }
  else if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(()=>toast("📋 Progress copied — paste it anywhere!")); }
  else toast("Sharing not supported here.");
}
function todayStr(){ return new Date().toISOString().slice(0,10); }
function packInit(){
  // share button in Progress
  const reset=document.getElementById("resetbtn");
  if(reset&&!document.getElementById("sharebtn")){
    const b=document.createElement("button"); b.id="sharebtn"; b.className="btn green";
    b.style.cssText="margin-top:10px;margin-right:8px;"; b.innerHTML="📤 Share my progress";
    b.onclick=shareProgress;
    reset.parentElement.insertBefore(b,reset);
  }
  // streak nudge (returning users, not practiced today)
  if(S.xp>0&&S.lastPractice!==todayStr()&&!document.getElementById("nudgebar")){
    const wrap=document.querySelector(".wrap");
    if(wrap){ const n=document.createElement("div"); n.id="nudgebar"; n.className="nudge";
      n.innerHTML='🔥 <b>Protect your streak!</b> A 2-minute quiz keeps it alive.'+
        '<span style="margin-left:auto;display:flex;gap:6px;"><button class="mini" id="nudgego">⚡ Quick quiz</button><button class="mini" id="nudgex">Later</button></span>';
      wrap.insertBefore(n,wrap.firstChild);
      document.getElementById("nudgego").onclick=()=>{ S.nudgeDate=todayStr(); save(); n.remove(); switchView("quiz"); };
      document.getElementById("nudgex").onclick=()=>{ S.nudgeDate=todayStr(); save(); n.remove(); };
    }
  }
  // daily reminder (browser notification, opt-in)
  const modal=document.querySelector("#settingsmodal .modal");
  if(modal&&!document.getElementById("remsrow")){
    const row=document.createElement("div"); row.className="srow"; row.id="remsrow";
    row.innerHTML='<span class="sl">🔔 Daily reminder</span><button class="mini" id="rembtn">Enable</button>'+
      '<span class="sd">Once a day, while Talkora is open, nudge me if I haven\'t practiced.</span>';
    modal.appendChild(row);
    const rb=document.getElementById("rembtn");
    const paint=()=>{ rb.textContent=S.remind?"ON ✓":"Enable"; rb.style.color=S.remind?"var(--good)":""; };
    rb.onclick=()=>{
      if(!("Notification" in window)){ toast("Notifications aren't supported in this browser."); return; }
      if(S.remind){ S.remind=false; save(); paint(); return; }
      Notification.requestPermission().then(p=>{
        if(p==="granted"){ S.remind=true; save(); toast("🔔 Reminder on — once a day."); }
        else toast("Permission not granted.");
        paint();
      });
    };
    paint();
  }
  // fire the notification once per unpracticed day
  if(S.remind&&("Notification" in window)&&Notification.permission==="granted"&&S.lastPractice!==todayStr()&&S.nudgeNotif!==todayStr()){
    S.nudgeNotif=todayStr(); save();
    try{ new Notification("Talkora 🔥",{body:"Your streak misses you — one quick quiz?"}); }catch(e){}
  }
  if(!S.tourDone) setTimeout(tourStart,700);
}
document.addEventListener("DOMContentLoaded",packInit);


/* ---------------- PRO POLISH (hero CTAs, bot session score, quick chips) ---------------- */
const FLAGS={en:"🇬",ta:"🇮",hi:"🇮🇳",ml:"🇮🇳",fr:"🇫"};
BOT.n=BOT.n||{turns:0,fixed:0,perfect:0};
function botScore(){
  const el=document.getElementById("botscore"); if(!el) return;
  el.innerHTML="🗨 <b>"+BOT.n.turns+"</b> turns · 🛠 <b>"+BOT.n.fixed+"</b> corrections · ✅ <b>"+BOT.n.perfect+"</b> perfect this session";
}
function initPro(){
  const c1=document.getElementById("herocta1"); if(c1) c1.onclick=()=>switchView("bot");
  const c2=document.getElementById("herocta2"); if(c2) c2.onclick=()=>switchView("quiz");
  document.addEventListener("click",(e)=>{
    const b=e.target&&e.target.closest?e.target.closest("[data-bact]"):null; if(!b) return;
    const a=b.getAttribute("data-bact");
    if(a==="try"){ S.bot.mode="learn"; save(); renderBotSeg(); botListen(); }
    else if(a==="hear"&&BOT.lastSay){ speak(BOT.lastSay,S.learn); }
    else if(a==="hearan"&&BOT.lastAn){ speak(BOT.lastAn,S.learn); }
  });
  botScore();
}
document.addEventListener("DOMContentLoaded",initPro);


/* ---------------- ROLEPLAY SCENES ---------------- */
const SCENES=[
  {id:"resto",  emoji:"🍽️", en:"Restaurant", role:"a friendly waiter at a busy restaurant", goal:"Order a meal, ask one question about the menu, then ask for the bill."},
  {id:"airport",emoji:"✈️", en:"Airport",    role:"an airline check-in agent",              goal:"Check in, ask about the gate and boarding time, and thank the agent."},
  {id:"shop",   emoji:"🛍️", en:"Shopping",   role:"a shopkeeper at a clothing store",       goal:"Ask the price and a different size, bargain once, then decide."},
  {id:"doctor", emoji:"🩺", en:"Doctor",     role:"a kind doctor",                          goal:"Describe two symptoms, ask what you should do, and say thanks."}
];
function sceneSys(){
  const sc=SCENES.find(x=>x.id===S.scene.id); const X=LANGS[S.speak],Y=LANGS[S.learn];
  return [
    "Roleplay game. You are "+sc.role+". The user (native "+X.name+") is the customer/guest speaking "+Y.name+".",
    "Mission for the user: "+sc.goal,
    "Stay in character. ONE short in-character line per turn in "+Y.name+".",
    "Reply ONLY valid JSON: {\"main\":\"your line in "+Y.name+"\",\"sub\":\"translation in "+X.name+"\",\"done\":false}",
    "When the user clearly completes the mission, set \"done\":true and add \"score\" (0-100 for clarity+politeness) and \"feedback\" (one encouraging sentence in "+X.name+" plus one tip)."
  ].join("\n");
}
function renderScenes(){
  const chips=document.getElementById("scenechips"); const bar=document.getElementById("scenebar");
  if(!chips||!bar) return;
  if(S.scene){
    chips.style.display="none"; bar.style.display="flex";
    const sc=SCENES.find(x=>x.id===S.scene.id);
    bar.innerHTML='<span style="font-size:18px;">'+sc.emoji+'</span>'+
      '<span style="flex:1;min-width:0;"><b>'+esc(sc.en)+'</b> · '+esc(sc.goal)+' <small style="opacity:.7;">· turn '+(S.scene.turns||0)+'</small></span>'+
      '<button class="mini" id="sceneend">🏁 Finish</button>';
    const e=document.getElementById("sceneend"); if(e) e.onclick=()=>finishScene(null);
  } else {
    chips.style.display="flex"; bar.style.display="none";
    chips.innerHTML='<span class="hint" style="align-self:center;">🎭 Roleplay:</span>'+
      SCENES.map(c=>'<button class="chip" data-sc="'+c.id+'">'+c.emoji+' '+c.en+'</button>').join("");
    chips.querySelectorAll("button").forEach(b=>b.onclick=()=>startScene(b.getAttribute("data-sc")));
  }
}
function startScene(id){
  if(!aiReady()){ toast("🎭 Roleplay needs the AI tutor — the free option needs no key 🤖"); openSettings(); return; }
  S.scene={id:id,turns:0}; save(); renderScenes();
  (async()=>{
    try{
      const a=await aiReply("Start the scene now. Greet me in character.",false,sceneSys());
      addMsg("bot",a.main,a.sub,null,S.learn);
      speak(a.main,S.learn);
    }catch(e){
      toast("⚠️ Scene error: "+e.message); S.scene=null; save(); renderScenes();
    }
  })();
}
function finishScene(a){
  const sc=S.scene&&SCENES.find(x=>x.id===S.scene.id); if(!sc) return;
  const score=a&&a.score!=null?Math.max(0,Math.min(100,Math.round(+a.score))):60;
  const fb=a&&a.feedback?String(a.feedback):"Nice scene — try another one!";
  S.scenesDone=(S.scenesDone||0)+1;
  const xp=Math.max(3,Math.round(score/10));
  S.scene=null; save();
  addMsg("bot","🎬 Scene complete — "+sc.en+"! "+(score>=80?"⭐ ":"")+"Score "+score+"/100. "+fb,null,null,S.speak);
  if(score>=80){ confetti(); speak("Wonderful! Scene complete!",S.learn); }
  else speak("Scene complete! Good practice.",S.learn);
  addXp(xp,"roleplay"); checkBadges(); renderScenes();
}
function initScenes(){ renderScenes(); }
document.addEventListener("DOMContentLoaded",initScenes);

/* ---------------- INIT ---------------- */
function initLangSelects(){
  const sS=document.getElementById("selSpeak"), sL=document.getElementById("selLearn");
  const opts=LCODES.map(c=>'<option value="'+c+'">'+(FLAGS[c]||"")+" "+LANGS[c].native+" · "+LANGS[c].name+'</option>').join("");
  sS.innerHTML=opts; sL.innerHTML=opts;
  sS.onchange=()=>{
    S.speak=sS.value;
    if(S.learn===S.speak) S.learn=S.speak==="en"?"ta":"en";
    sL.value=S.learn;
    applyDirection();
  };
  sL.onchange=()=>{
    S.learn=sL.value;
    if(S.speak===S.learn) S.speak=S.learn==="en"?"ta":"en";
    sS.value=S.speak;
    applyDirection();
  };
}
function init(){
  applyDark();
  renderXp();
  initMicBanner();
  initLangSelects();
  applyDirection();
  bindSettings();
  updateAiBadge();
  renderRecents();
  renderLessonCats();

  document.querySelectorAll("#tabs button").forEach(b=>{
    b.onclick=()=>switchView(b.getAttribute("data-view"));
  });

  const ci=document.getElementById("chatinput");
  const send=()=>{ const v=ci.value; ci.value=""; document.getElementById("interim").textContent=""; handleUserText(v); };
  document.getElementById("sendbtn").onclick=send;
  ci.addEventListener("keydown",e=>{ if(e.key==="Enter") send(); });

  const micbtn=document.getElementById("micbtn");
  micbtn.onclick=()=>{
    if(!SR){ showMicBanner("⚠️ Voice not supported here — please type. (Chrome/Edge works best)"); return; }
    if(recBusy) return;
    recBusy=true; setMic(true);
    document.getElementById("interim").textContent="";
    rec=newRec(S.speak,{
      interim:t=>{ document.getElementById("interim").textContent="… "+t; },
      text:t=>{ document.getElementById("interim").textContent=""; ci.value=t; send(); }
    },()=>{ rec=null; });
    try{ rec.start(); }catch(e){ recBusy=false; setMic(false); }
  };

  document.getElementById("slowbtn").onclick=function(){
    S.slow=!S.slow; save();
    this.textContent="🐢 Slow voice: "+(S.slow?"ON":"OFF");
  };
  if(S.slow) document.getElementById("slowbtn").textContent="🐢 Slow voice: ON";
  document.getElementById("replaybtn").onclick=()=>{ if(lastBotText) speak(lastBotText,lastBotLang||S.learn); };
  document.getElementById("clearbtn").onclick=()=>{ chatlog.innerHTML=""; CHAT_HIST=[]; botGreet(); };

  const ti=document.getElementById("transinput");
  document.getElementById("transbtn").onclick=()=>{ const v=ti.value; translate(v); ti.value=""; };
  ti.addEventListener("keydown",e=>{ if(e.key==="Enter"){ const v=ti.value; translate(v); ti.value=""; } });
  document.getElementById("tmscbtn").onclick=()=>{
    if(!SR){ showMicBanner("⚠️ Voice not supported here — please type. (Chrome/Edge works best)"); return; }
    if(recBusy) return;
    recBusy=true; setMic(true);
    rec=newRec(S.speak,{
      interim:t=>{ document.getElementById("interim").textContent="… "+t; },
      text:t=>{ ti.value=t; translate(t); ti.value=""; }
    },()=>{ rec=null; });
    try{ rec.start(); }catch(e){ recBusy=false; setMic(false); }
  };

  document.getElementById("fflip").onclick=()=>{ document.getElementById("fcard").classList.toggle("flipped"); fFlipped=!fFlipped; };
  document.getElementById("fcard").onclick=()=>{ document.getElementById("fcard").classList.toggle("flipped"); fFlipped=!fFlipped; };
  document.getElementById("fknow").onclick=()=>fMark("know");
  document.getElementById("ffail").onclick=()=>fMark("again");
  document.getElementById("faudio").onclick=fAudio;
  document.getElementById("frestart").onclick=()=>{
    if(fCat!=="all"&&fCat!=="__mistakes"){ S.known[fCat]=[]; S.unknown[fCat]=[]; fFailSet=new Set(); save(); }
    renderCatbar(); renderCard();
  };
  document.getElementById("freview").onclick=()=>{
    fCat="__mistakes"; renderCatbar(); renderCard();
    if(!fDeckItems().length) toast("No mistakes to review — you're doing great! 🌟");
  };

  document.getElementById("qreadbtn").onclick=()=>startQuiz("read");
  document.getElementById("qlistenbtn").onclick=()=>{ if(!("speechSynthesis" in window)){ toast("TTS not supported in this browser 🎧"); return; } startQuiz("listen"); };
  document.getElementById("qagainbtn").onclick=()=>{ document.getElementById("quizdone").style.display="none"; document.getElementById("quizmenu").style.display="block"; };

  document.getElementById("pskip").onclick=pNewPhrase;
  document.getElementById("pmicbtn").onclick=()=>{
    if(!SR){ document.getElementById("primicnote").textContent="⚠️ Speech recognition not supported here — use Chrome/Edge for voice scoring."; return; }
    if(recBusy||!pPhrase) return;
    recBusy=true; setMic(true);
    rec=newRec(S.learn,{ text:t=>{ pScore(t); } },()=>{ rec=null; });
    try{ rec.start(); }catch(e){ recBusy=false; setMic(false); }
  };

  document.getElementById("resetbtn").onclick=()=>{
    if(confirm("Reset ALL progress (XP, streak, known words)?")){
      localStorage.removeItem(SKEY);
      location.reload();
    }
  };

  initV3();
}
document.addEventListener("DOMContentLoaded",init);


/* ---------------- PWA: install prompt + service worker ---------------- */
(function(){
  var bar=document.getElementById("installbar");
  if(!bar) return;
  var sub=document.getElementById("ibsub"),
      btn=document.getElementById("ibinstall"),
      x=document.getElementById("ibx");
  var deferred=null, shown=false;
  var standalone=(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true;
  var ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  var mobile=/mobi|iphone|ipad|android/i.test(navigator.userAgent);
  function dismissed(){try{return localStorage.getItem("vh_install_dismissed")==="1";}catch(e){return true;}}
  function closeBar(){bar.classList.remove("on");}
  x.onclick=function(){closeBar();try{localStorage.setItem("vh_install_dismissed","1");}catch(e){}};
  window.addEventListener("appinstalled",function(){
    closeBar();
    try{localStorage.setItem("vh_install_dismissed","1");}catch(e){}
    var t=document.getElementById("toast");
    if(t){t.classList.add("on");setTimeout(function(){t.classList.remove("on");},2600);}
  });
  function showBar(html,btnText,btnFn){
    sub.innerHTML=html;
    btn.textContent=btnText;
    btn.onclick=btnFn||function(){closeBar();};
    bar.classList.add("on");
    shown=true;
  }
  if(standalone) return; // already running as an installed app

  if(!ios){
    // Android / desktop Chrome: use the real one-tap install prompt
    window.addEventListener("beforeinstallprompt",function(e){
      e.preventDefault();
      deferred=e;
      if(dismissed()||shown) return;
      showBar(
        mobile?"Add it to your home screen — full-screen app that works offline.":"Install Talkora as an app — fast launch, works offline.",
        "Install",
        function(){ if(deferred) deferred.prompt(); }
      );
    });
  } else {
    // iOS Safari: no install event — show one-time instructions
    setTimeout(function(){
      if(dismissed()||shown) return;
      showBar(
        'In Safari, tap <b>Share</b> 📤 then <b>Add to Home Screen</b> to install the app.',
        "Got it",
        function(){closeBar();try{localStorage.setItem("vh_install_dismissed","1");}catch(e){}}
      );
    },5000);
  }

  // Offline PWA: register the service worker (silently skips if unsupported)
  if("serviceWorker" in navigator){
    window.addEventListener("load",function(){
      navigator.serviceWorker.register("sw.js").catch(function(){});
    });
  }
})();
