// Interface translations for the languages offered in the Language menu.
export const LANGS = ["English", "Swahili", "French", "Arabic", "Spanish", "Portuguese", "German", "Italian", "Chinese", "Hindi", "Somali"] as const;
export type Lang = (typeof LANGS)[number];
export const NATIVE: Record<Lang, string> = {
  English: "English", Swahili: "Kiswahili", French: "Français", Arabic: "العربية", Spanish: "Español",
  Portuguese: "Português", German: "Deutsch", Italian: "Italiano", Chinese: "中文", Hindi: "हिन्दी", Somali: "Soomaali",
};

// Support phone supplied by the shop owner; email awaits confirmation.
export const SUPPORT = { email: "support@shopbook.app", whatsapp: "254722288012", phone: "0722288012" };

const KEYS = [
  "trialRemaining", "usingPlan", "daysLeft", "profileBusiness", "language", "currency", "help", "back",
  "profile", "email", "role", "admin", "business", "shopName", "plan", "manageSub", "signOut",
  "upgradeRequired", "notIncluded", "upgradePlan", "comingNext", "saved", "fullTrial", "planSuffix",
  "helpIntro", "faq", "contact", "emailSupport", "whatsappSupport", "hours", "aiSoon",
  "q1", "a1", "q2", "a2", "q3", "a3", "q4", "a4",
  "dashboard", "inventory", "purchases", "sales", "pos", "expenses", "contacts", "accounting", "float", "payroll", "reports", "summary", "settings",
] as const;
type Key = (typeof KEYS)[number];

const T: Record<Lang, string[]> = {
  Somali: ["Tijaabada bilaashka ah ee harsan", "Waxaad isticmaalaysaa {x}", "{x} maalmood ayaa haray", "Boggaaga iyo ganacsiga", "Luqad", "Lacagta", "Caawimo iyo taageero", "Dib", "Boggaaga", "Iimayl", "Doorka", "Maamule", "Ganacsi", "Magaca dukaanka", "Qorshe", "Maamul rukunka", "Ka bax", "Qorshe sare ayaa loo baahan yahay", "{x} kuma jiro qorshahaaga hadda.", "Kor u qaad qorshaha", "{x} wuxuu imanayaa tallaabada xigta.", "Waa la kaydiyey", "Tijaabada ERP oo dhammaystiran", "Qorshaha {x}", "Hoos ka hel jawaabo degdeg ah ama la xiriir kooxdayada taageerada.", "Su'aalaha caadiga ah", "La xiriir taageerada", "Taageero iimayl", "Ku sheekayso WhatsApp", "Isn–Sab, 8 subaxnimo–8 fiidnimo EAT", "Kaaliyaha AI dhawaan ayuu imanayaa.", "Sideen u dallacsiiyaa qorshahayga?", "Fur liiska, taabo Xogtaada iyo Ganacsiga, kadib Maamul Rukunka oo dooro qorshe.", "Maxaa abka u xiran yahay?", "Ababka xiran kuma jiraan qorshahaaga hadda. Dallacsii si aad u furto.", "Maxaa dhacaya marka tijaabadaydu dhammaato?", "Dooro qorshe lacag leh si aad u sii isticmaasho SHOPBOOK. Xogtaadu way kuu kaydsan tahay.", "Sideen u beddelaa luqadda ama lacagta?", "Fur liiska oo taabo Luqadda ama Lacagta.", "Dulmar", "Kaydka", "Wax iibsiga", "Iibinta", "POS", "Kharashaadka", "Xiriirrada", "Xisaabaadka", "Lacagta wareegta", "Mushaharka", "Warbixinnada", "Soo koobid", "Dejinta"],
  English: ["Free Trial Remaining", "You are using the {x}", "{x} Days Left", "Profile & Business", "Language", "Currency", "Help & Support", "Back",
    "Profile", "Email", "Role", "Admin", "Business", "Shop name", "Plan", "Manage Subscription", "Sign Out",
    "Upgrade Required", "{x} is not included in your current plan.", "Upgrade Plan", "{x} is coming in the next step.", "Saved", "Full ERP Trial", "{x} plan",
    "Find quick answers below or contact our support team.", "Common questions", "Contact support", "Email support", "Chat on WhatsApp", "Mon–Sat, 8am–8pm EAT", "AI assistant is coming soon.",
    "How do I upgrade my plan?", "Open the menu, tap Profile & Business, then Manage Subscription and choose a plan.",
    "Why is an app locked?", "Locked apps are not part of your current plan. Upgrade to unlock them.",
    "What happens when my trial ends?", "Choose a paid plan to keep using SHOPBOOK. Your data stays.",
    "How do I change language or currency?", "Open the menu and tap Language or Currency.",
    "Dashboard", "Inventory", "Purchases", "Sales", "POS", "Expenses", "Contacts", "Accounting", "Float", "Payroll", "Reports", "Summary", "Settings"],
  Swahili: ["Muda wa Majaribio Uliobaki", "Unatumia {x}", "Siku {x} Zimebaki", "Wasifu na Biashara", "Lugha", "Sarafu", "Msaada", "Rudi",
    "Wasifu", "Barua pepe", "Wadhifa", "Msimamizi", "Biashara", "Jina la duka", "Mpango", "Dhibiti Usajili", "Ondoka",
    "Uboreshaji Unahitajika", "{x} haipo katika mpango wako wa sasa.", "Boresha Mpango", "{x} inakuja hatua inayofuata.", "Imehifadhiwa", "Majaribio Kamili ya ERP", "Mpango wa {x}",
    "Pata majibu ya haraka hapa chini au wasiliana na timu yetu.", "Maswali ya kawaida", "Wasiliana na msaada", "Tuma barua pepe", "Ongea kwa WhatsApp", "Jumatatu–Jumamosi, 2 asubuhi–2 usiku", "Msaidizi wa AI unakuja hivi karibuni.",
    "Ninaboreshaje mpango wangu?", "Fungua menyu, gusa Wasifu na Biashara, kisha Dhibiti Usajili na uchague mpango.",
    "Kwa nini programu imefungwa?", "Programu zilizofungwa hazipo kwenye mpango wako. Boresha ili kuzifungua.",
    "Nini kinatokea majaribio yakiisha?", "Chagua mpango wa kulipia ili uendelee. Data yako inabaki.",
    "Ninabadilishaje lugha au sarafu?", "Fungua menyu na uguse Lugha au Sarafu.",
    "Dashibodi", "Bidhaa", "Manunuzi", "Mauzo", "POS", "Matumizi", "Anwani", "Uhasibu", "Float", "Mishahara", "Ripoti", "Muhtasari", "Mipangilio"],
  French: ["Essai gratuit restant", "Vous utilisez {x}", "{x} jours restants", "Profil et entreprise", "Langue", "Devise", "Aide et support", "Retour",
    "Profil", "E-mail", "Rôle", "Administrateur", "Entreprise", "Nom de la boutique", "Forfait", "Gérer l'abonnement", "Se déconnecter",
    "Mise à niveau requise", "{x} n'est pas inclus dans votre forfait actuel.", "Mettre à niveau", "{x} arrive à la prochaine étape.", "Enregistré", "Essai ERP complet", "Forfait {x}",
    "Trouvez des réponses rapides ci-dessous ou contactez notre équipe.", "Questions fréquentes", "Contacter le support", "Écrire au support", "Discuter sur WhatsApp", "Lun–Sam, 8h–20h EAT", "L'assistant IA arrive bientôt.",
    "Comment changer de forfait ?", "Ouvrez le menu, Profil et entreprise, puis Gérer l'abonnement.",
    "Pourquoi une application est verrouillée ?", "Elle ne fait pas partie de votre forfait. Mettez à niveau pour la débloquer.",
    "Que se passe-t-il à la fin de l'essai ?", "Choisissez un forfait payant pour continuer. Vos données sont conservées.",
    "Comment changer la langue ou la devise ?", "Ouvrez le menu et touchez Langue ou Devise.",
    "Tableau de bord", "Inventaire", "Achats", "Ventes", "Caisse", "Dépenses", "Contacts", "Comptabilité", "Float", "Paie", "Rapports", "Résumé", "Paramètres"],
  Arabic: ["الفترة التجريبية المتبقية", "أنت تستخدم {x}", "متبقي {x} يوم", "الملف والنشاط التجاري", "اللغة", "العملة", "المساعدة والدعم", "رجوع",
    "الملف الشخصي", "البريد الإلكتروني", "الدور", "مسؤول", "النشاط التجاري", "اسم المتجر", "الخطة", "إدارة الاشتراك", "تسجيل الخروج",
    "الترقية مطلوبة", "{x} غير مشمول في خطتك الحالية.", "ترقية الخطة", "{x} قادم في الخطوة التالية.", "تم الحفظ", "تجربة ERP الكاملة", "خطة {x}",
    "اعثر على إجابات سريعة أدناه أو تواصل مع فريق الدعم.", "أسئلة شائعة", "تواصل مع الدعم", "راسل الدعم", "الدردشة عبر واتساب", "الإثنين–السبت، 8ص–8م", "المساعد الذكي قادم قريبًا.",
    "كيف أرقّي خطتي؟", "افتح القائمة، ثم الملف والنشاط التجاري، ثم إدارة الاشتراك.",
    "لماذا التطبيق مقفل؟", "التطبيقات المقفلة ليست ضمن خطتك. قم بالترقية لفتحها.",
    "ماذا يحدث عند انتهاء التجربة؟", "اختر خطة مدفوعة للمتابعة. تبقى بياناتك محفوظة.",
    "كيف أغيّر اللغة أو العملة؟", "افتح القائمة واختر اللغة أو العملة.",
    "لوحة التحكم", "المخزون", "المشتريات", "المبيعات", "نقطة البيع", "المصروفات", "جهات الاتصال", "المحاسبة", "الرصيد", "الرواتب", "التقارير", "الملخص", "الإعدادات"],
  Spanish: ["Prueba gratuita restante", "Estás usando {x}", "Quedan {x} días", "Perfil y negocio", "Idioma", "Moneda", "Ayuda y soporte", "Atrás",
    "Perfil", "Correo", "Rol", "Administrador", "Negocio", "Nombre de la tienda", "Plan", "Gestionar suscripción", "Cerrar sesión",
    "Se requiere mejora", "{x} no está incluido en tu plan actual.", "Mejorar plan", "{x} llegará en el siguiente paso.", "Guardado", "Prueba ERP completa", "Plan {x}",
    "Encuentra respuestas rápidas abajo o contacta a nuestro equipo.", "Preguntas frecuentes", "Contactar soporte", "Escribir a soporte", "Chatear por WhatsApp", "Lun–Sáb, 8am–8pm EAT", "El asistente de IA llegará pronto.",
    "¿Cómo mejoro mi plan?", "Abre el menú, Perfil y negocio, luego Gestionar suscripción.",
    "¿Por qué una app está bloqueada?", "No forma parte de tu plan. Mejóralo para desbloquearla.",
    "¿Qué pasa cuando termina la prueba?", "Elige un plan de pago para continuar. Tus datos se conservan.",
    "¿Cómo cambio el idioma o la moneda?", "Abre el menú y toca Idioma o Moneda.",
    "Panel", "Inventario", "Compras", "Ventas", "TPV", "Gastos", "Contactos", "Contabilidad", "Float", "Nómina", "Informes", "Resumen", "Ajustes"],
  Portuguese: ["Teste grátis restante", "Você está usando {x}", "{x} dias restantes", "Perfil e negócio", "Idioma", "Moeda", "Ajuda e suporte", "Voltar",
    "Perfil", "E-mail", "Função", "Administrador", "Negócio", "Nome da loja", "Plano", "Gerir assinatura", "Sair",
    "Atualização necessária", "{x} não está incluído no seu plano atual.", "Atualizar plano", "{x} chega na próxima etapa.", "Salvo", "Teste ERP completo", "Plano {x}",
    "Encontre respostas rápidas abaixo ou fale com nossa equipe.", "Perguntas frequentes", "Falar com o suporte", "Enviar e-mail", "Conversar no WhatsApp", "Seg–Sáb, 8h–20h EAT", "O assistente de IA chega em breve.",
    "Como atualizo meu plano?", "Abra o menu, Perfil e negócio, depois Gerir assinatura.",
    "Por que um app está bloqueado?", "Ele não faz parte do seu plano. Atualize para desbloquear.",
    "O que acontece quando o teste acaba?", "Escolha um plano pago para continuar. Seus dados ficam salvos.",
    "Como mudo o idioma ou a moeda?", "Abra o menu e toque em Idioma ou Moeda.",
    "Painel", "Estoque", "Compras", "Vendas", "PDV", "Despesas", "Contatos", "Contabilidade", "Float", "Folha", "Relatórios", "Resumo", "Configurações"],
  German: ["Verbleibende Testphase", "Sie nutzen {x}", "Noch {x} Tage", "Profil & Unternehmen", "Sprache", "Währung", "Hilfe & Support", "Zurück",
    "Profil", "E-Mail", "Rolle", "Administrator", "Unternehmen", "Shopname", "Tarif", "Abo verwalten", "Abmelden",
    "Upgrade erforderlich", "{x} ist in Ihrem Tarif nicht enthalten.", "Tarif upgraden", "{x} kommt im nächsten Schritt.", "Gespeichert", "Volle ERP-Testphase", "{x}-Tarif",
    "Schnelle Antworten unten oder kontaktieren Sie unser Team.", "Häufige Fragen", "Support kontaktieren", "E-Mail an Support", "Per WhatsApp chatten", "Mo–Sa, 8–20 Uhr EAT", "Der KI-Assistent kommt bald.",
    "Wie upgrade ich meinen Tarif?", "Menü öffnen, Profil & Unternehmen, dann Abo verwalten.",
    "Warum ist eine App gesperrt?", "Sie ist nicht in Ihrem Tarif. Upgraden Sie, um sie freizuschalten.",
    "Was passiert nach der Testphase?", "Wählen Sie einen bezahlten Tarif. Ihre Daten bleiben erhalten.",
    "Wie ändere ich Sprache oder Währung?", "Menü öffnen und Sprache oder Währung tippen.",
    "Dashboard", "Lager", "Einkauf", "Verkauf", "Kasse", "Ausgaben", "Kontakte", "Buchhaltung", "Float", "Lohn", "Berichte", "Übersicht", "Einstellungen"],
  Italian: ["Prova gratuita rimanente", "Stai usando {x}", "{x} giorni rimasti", "Profilo e attività", "Lingua", "Valuta", "Aiuto e supporto", "Indietro",
    "Profilo", "Email", "Ruolo", "Amministratore", "Attività", "Nome negozio", "Piano", "Gestisci abbonamento", "Esci",
    "Upgrade richiesto", "{x} non è incluso nel tuo piano attuale.", "Aggiorna piano", "{x} arriverà nel prossimo passo.", "Salvato", "Prova ERP completa", "Piano {x}",
    "Trova risposte rapide qui sotto o contatta il nostro team.", "Domande frequenti", "Contatta il supporto", "Scrivi al supporto", "Chatta su WhatsApp", "Lun–Sab, 8–20 EAT", "L'assistente IA arriverà presto.",
    "Come aggiorno il mio piano?", "Apri il menu, Profilo e attività, poi Gestisci abbonamento.",
    "Perché un'app è bloccata?", "Non fa parte del tuo piano. Aggiorna per sbloccarla.",
    "Cosa succede alla fine della prova?", "Scegli un piano a pagamento per continuare. I tuoi dati restano.",
    "Come cambio lingua o valuta?", "Apri il menu e tocca Lingua o Valuta.",
    "Dashboard", "Magazzino", "Acquisti", "Vendite", "Cassa", "Spese", "Contatti", "Contabilità", "Float", "Paghe", "Report", "Riepilogo", "Impostazioni"],
  Chinese: ["免费试用剩余", "您正在使用{x}", "剩余 {x} 天", "个人与企业", "语言", "货币", "帮助与支持", "返回",
    "个人资料", "邮箱", "角色", "管理员", "企业", "店铺名称", "套餐", "管理订阅", "退出登录",
    "需要升级", "{x} 不在您当前的套餐中。", "升级套餐", "{x} 将在下一步推出。", "已保存", "完整 ERP 试用", "{x} 套餐",
    "在下方查找快速解答，或联系我们的支持团队。", "常见问题", "联系支持", "发送邮件", "WhatsApp 聊天", "周一至周六 8:00–20:00 (EAT)", "AI 助手即将推出。",
    "如何升级套餐？", "打开菜单，点击个人与企业，然后点击管理订阅。",
    "为什么应用被锁定？", "该应用不在您的套餐中。升级即可解锁。",
    "试用结束后会怎样？", "选择付费套餐即可继续使用，数据会保留。",
    "如何更改语言或货币？", "打开菜单，点击语言或货币。",
    "仪表盘", "库存", "采购", "销售", "收银", "支出", "联系人", "会计", "备用金", "工资", "报表", "摘要", "设置"],
  Hindi: ["शेष निःशुल्क परीक्षण", "आप {x} उपयोग कर रहे हैं", "{x} दिन शेष", "प्रोफ़ाइल और व्यवसाय", "भाषा", "मुद्रा", "सहायता और समर्थन", "वापस",
    "प्रोफ़ाइल", "ईमेल", "भूमिका", "व्यवस्थापक", "व्यवसाय", "दुकान का नाम", "योजना", "सदस्यता प्रबंधित करें", "साइन आउट",
    "अपग्रेड आवश्यक", "{x} आपकी वर्तमान योजना में शामिल नहीं है।", "योजना अपग्रेड करें", "{x} अगले चरण में आ रहा है।", "सहेजा गया", "पूर्ण ERP परीक्षण", "{x} योजना",
    "नीचे त्वरित उत्तर देखें या हमारी टीम से संपर्क करें।", "सामान्य प्रश्न", "समर्थन से संपर्क करें", "ईमेल भेजें", "WhatsApp पर चैट करें", "सोम–शनि, सुबह 8–रात 8 EAT", "AI सहायक जल्द आ रहा है।",
    "मैं अपनी योजना कैसे अपग्रेड करूँ?", "मेन्यू खोलें, प्रोफ़ाइल और व्यवसाय, फिर सदस्यता प्रबंधित करें।",
    "ऐप लॉक क्यों है?", "यह आपकी योजना में नहीं है। अनलॉक करने के लिए अपग्रेड करें।",
    "परीक्षण समाप्त होने पर क्या होगा?", "जारी रखने के लिए सशुल्क योजना चुनें। आपका डेटा सुरक्षित रहेगा।",
    "भाषा या मुद्रा कैसे बदलूँ?", "मेन्यू खोलें और भाषा या मुद्रा चुनें।",
    "डैशबोर्ड", "इन्वेंटरी", "खरीद", "बिक्री", "POS", "खर्च", "संपर्क", "लेखांकन", "फ्लोट", "वेतन", "रिपोर्ट", "सारांश", "सेटिंग्स"],
};

export function getT(lang?: string) {
  const l = (LANGS as readonly string[]).includes(lang || "") ? (lang as Lang) : "English";
  const row = T[l];
  const t = (k: Key, x?: string | number): string => {
    const s = row[KEYS.indexOf(k)] ?? T.English[KEYS.indexOf(k)] ?? k;
    return x === undefined ? s : s.replace("{x}", String(x));
  };
  return { t, dir: l === "Arabic" ? ("rtl" as const) : ("ltr" as const) };
}
export type TKey = Key;
