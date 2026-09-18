export interface CurrencyInfo {
    code: string;
    name: string;
    symbol: string;
    flag: string;
    decimals: number;
    region: 'Americas' | 'Europe' | 'Africa' | 'Asia & Pacific' | 'Middle East';
    country: string;
    isPopular?: boolean;
    standardRate: number; // baseline exchange rate relative to USD (1 USD = X currency)
}

// Complete list of ISO 4217 standard circulating world currencies
// Standard base is USD (1 USD = rate) based on European Central Bank (ECB) and Forex Mid-Market reference benchmarks
export const ALL_CURRENCIES: CurrencyInfo[] = [
    // Major Global Currencies
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', decimals: 2, region: 'Americas', country: 'United States', isPopular: true, standardRate: 1.0 },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', decimals: 2, region: 'Europe', country: 'Eurozone', isPopular: true, standardRate: 0.918 },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', decimals: 2, region: 'Europe', country: 'United Kingdom', isPopular: true, standardRate: 0.772 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', decimals: 0, region: 'Asia & Pacific', country: 'Japan', isPopular: true, standardRate: 147.25 },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦', decimals: 2, region: 'Americas', country: 'Canada', isPopular: true, standardRate: 1.365 },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', decimals: 2, region: 'Asia & Pacific', country: 'Australia', isPopular: true, standardRate: 1.512 },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', decimals: 2, region: 'Europe', country: 'Switzerland', isPopular: true, standardRate: 0.852 },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', decimals: 2, region: 'Asia & Pacific', country: 'China', isPopular: true, standardRate: 7.12 },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', decimals: 2, region: 'Asia & Pacific', country: 'India', isPopular: true, standardRate: 83.95 },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', decimals: 2, region: 'Americas', country: 'Brazil', isPopular: true, standardRate: 5.58 },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', decimals: 2, region: 'Africa', country: 'South Africa', isPopular: true, standardRate: 17.85 },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪', decimals: 2, region: 'Africa', country: 'Kenya', isPopular: true, standardRate: 129.50 },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬', decimals: 2, region: 'Africa', country: 'Nigeria', isPopular: true, standardRate: 1610.0 },
    { code: 'AED', name: 'UAE Dirham', symbol: 'AED', flag: '🇦🇪', decimals: 2, region: 'Middle East', country: 'United Arab Emirates', isPopular: true, standardRate: 3.6725 },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', flag: '🇸🇦', decimals: 2, region: 'Middle East', country: 'Saudi Arabia', isPopular: true, standardRate: 3.75 },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', decimals: 2, region: 'Asia & Pacific', country: 'Singapore', isPopular: true, standardRate: 1.305 },

    // Africa
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬', decimals: 2, region: 'Africa', country: 'Egypt', isPopular: true, standardRate: 48.45 },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', flag: '🇬🇭', decimals: 2, region: 'Africa', country: 'Ghana', isPopular: true, standardRate: 15.65 },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', flag: '🇺🇬', decimals: 0, region: 'Africa', country: 'Uganda', standardRate: 3715.0 },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿', decimals: 0, region: 'Africa', country: 'Tanzania', standardRate: 2710.0 },
    { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', flag: '🇷🇼', decimals: 0, region: 'Africa', country: 'Rwanda', standardRate: 1350.0 },
    { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', flag: '🇪🇹', decimals: 2, region: 'Africa', country: 'Ethiopia', standardRate: 118.50 },
    { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD', flag: '🇲🇦', decimals: 2, region: 'Africa', country: 'Morocco', standardRate: 9.82 },
    { code: 'DZD', name: 'Algerian Dinar', symbol: 'DA', flag: '🇩🇿', decimals: 2, region: 'Africa', country: 'Algeria', standardRate: 133.6 },
    { code: 'TND', name: 'Tunisian Dinar', symbol: 'DT', flag: '🇹🇳', decimals: 3, region: 'Africa', country: 'Tunisia', standardRate: 3.08 },
    { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', flag: '🇿🇲', decimals: 2, region: 'Africa', country: 'Zambia', standardRate: 26.4 },
    { code: 'BWP', name: 'Botswana Pula', symbol: 'P', flag: '🇧🇼', decimals: 2, region: 'Africa', country: 'Botswana', standardRate: 13.45 },
    { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', flag: '🇲🇺', decimals: 2, region: 'Africa', country: 'Mauritius', standardRate: 46.2 },
    { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', flag: '🇲🇿', decimals: 2, region: 'Africa', country: 'Mozambique', standardRate: 63.8 },
    { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', flag: '🇦🇴', decimals: 2, region: 'Africa', country: 'Angola', standardRate: 915.0 },
    { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', flag: '🇨🇮', decimals: 0, region: 'Africa', country: 'West Africa (UEMOA)', standardRate: 602.0 },
    { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', flag: '🇨🇲', decimals: 0, region: 'Africa', country: 'Central Africa (CEMAC)', standardRate: 602.0 },
    { code: 'CDF', name: 'Congolese Franc', symbol: 'FC', flag: '🇨🇩', decimals: 2, region: 'Africa', country: 'Democratic Republic of Congo', standardRate: 2850.0 },
    { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', flag: '🇳🇦', decimals: 2, region: 'Africa', country: 'Namibia', standardRate: 17.85 },
    { code: 'SZL', name: 'Eswatini Lilangeni', symbol: 'E', flag: '🇸🇿', decimals: 2, region: 'Africa', country: 'Eswatini', standardRate: 17.85 },
    { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', flag: '🇱🇸', decimals: 2, region: 'Africa', country: 'Lesotho', standardRate: 17.85 },
    { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', flag: '🇲🇼', decimals: 2, region: 'Africa', country: 'Malawi', standardRate: 1735.0 },
    { code: 'SCR', name: 'Seychellois Rupee', symbol: 'SR', flag: '🇸🇨', decimals: 2, region: 'Africa', country: 'Seychelles', standardRate: 13.9 },
    { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', flag: '🇬🇲', decimals: 2, region: 'Africa', country: 'Gambia', standardRate: 70.5 },
    { code: 'GNF', name: 'Guinean Franc', symbol: 'FG', flag: '🇬🇳', decimals: 0, region: 'Africa', country: 'Guinea', standardRate: 8640.0 },
    { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh', flag: '🇸🇴', decimals: 2, region: 'Africa', country: 'Somalia', standardRate: 571.0 },
    { code: 'SLS', name: 'Somaliland Shilling', symbol: 'Sl.Sh', flag: '🇸🇴', decimals: 2, region: 'Africa', country: 'Somaliland', standardRate: 8500.0 },
    { code: 'SSP', name: 'South Sudanese Pound', symbol: 'SS£', flag: '🇸🇸', decimals: 2, region: 'Africa', country: 'South Sudan', standardRate: 1550.0 },
    { code: 'SDG', name: 'Sudanese Pound', symbol: 'SDG', flag: '🇸🇩', decimals: 2, region: 'Africa', country: 'Sudan', standardRate: 601.0 },
    { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu', flag: '🇧🇮', decimals: 0, region: 'Africa', country: 'Burundi', standardRate: 2890.0 },
    { code: 'CVE', name: 'Cape Verdean Escudo', symbol: 'Esc', flag: '🇨🇻', decimals: 2, region: 'Africa', country: 'Cape Verde', standardRate: 101.2 },
    { code: 'KMF', name: 'Comorian Franc', symbol: 'CF', flag: '🇰🇲', decimals: 0, region: 'Africa', country: 'Comoros', standardRate: 451.5 },
    { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', flag: '🇩🇯', decimals: 0, region: 'Africa', country: 'Djibouti', standardRate: 177.72 },
    { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk', flag: '🇪🇷', decimals: 2, region: 'Africa', country: 'Eritrea', standardRate: 15.0 },
    { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$', flag: '🇱🇷', decimals: 2, region: 'Africa', country: 'Liberia', standardRate: 194.5 },
    { code: 'LYD', name: 'Libyan Dinar', symbol: 'LD', flag: '🇱🇾', decimals: 3, region: 'Africa', country: 'Libya', standardRate: 4.82 },
    { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', flag: '🇲🇬', decimals: 2, region: 'Africa', country: 'Madagascar', standardRate: 4550.0 },
    { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM', flag: '🇲🇷', decimals: 2, region: 'Africa', country: 'Mauritania', standardRate: 39.8 },
    { code: 'STN', name: 'São Tomé & Príncipe Dobra', symbol: 'Db', flag: '🇸🇹', decimals: 2, region: 'Africa', country: 'São Tomé & Príncipe', standardRate: 22.5 },
    { code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'Le', flag: '🇸🇱', decimals: 2, region: 'Africa', country: 'Sierra Leone', standardRate: 22.8 },

    // Europe
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', decimals: 2, region: 'Europe', country: 'Sweden', isPopular: true, standardRate: 10.35 },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', decimals: 2, region: 'Europe', country: 'Norway', isPopular: true, standardRate: 10.68 },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr.', flag: '🇩🇰', decimals: 2, region: 'Europe', country: 'Denmark', standardRate: 6.85 },
    { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱', decimals: 2, region: 'Europe', country: 'Poland', isPopular: true, standardRate: 3.92 },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿', decimals: 2, region: 'Europe', country: 'Czech Republic', standardRate: 23.1 },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺', decimals: 0, region: 'Europe', country: 'Hungary', standardRate: 362.0 },
    { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴', decimals: 2, region: 'Europe', country: 'Romania', standardRate: 4.56 },
    { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', flag: '🇧🇬', decimals: 2, region: 'Europe', country: 'Bulgaria', standardRate: 1.79 },
    { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', flag: '🇭🇷', decimals: 2, region: 'Europe', country: 'Croatia', standardRate: 6.92 },
    { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', flag: '🇮🇸', decimals: 0, region: 'Europe', country: 'Iceland', standardRate: 138.5 },
    { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.', flag: '🇷🇸', decimals: 2, region: 'Europe', country: 'Serbia', standardRate: 107.5 },
    { code: 'ALL', name: 'Albanian Lek', symbol: 'L', flag: '🇦🇱', decimals: 2, region: 'Europe', country: 'Albania', standardRate: 91.2 },
    { code: 'BAM', name: 'Bosnia-Herzegovina Mark', symbol: 'KM', flag: '🇧🇦', decimals: 2, region: 'Europe', country: 'Bosnia & Herzegovina', standardRate: 1.79 },
    { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', flag: '🇲🇰', decimals: 2, region: 'Europe', country: 'North Macedonia', standardRate: 56.5 },
    { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', flag: '🇲🇩', decimals: 2, region: 'Europe', country: 'Moldova', standardRate: 17.6 },
    { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', flag: '🇺🇦', decimals: 2, region: 'Europe', country: 'Ukraine', standardRate: 41.2 },
    { code: 'GEL', name: 'Georgian Lari', symbol: '₾', flag: '🇬🇪', decimals: 2, region: 'Europe', country: 'Georgia', standardRate: 2.70 },
    { code: 'AMD', name: 'Armenian Dram', symbol: '֏', flag: '🇦🇲', decimals: 2, region: 'Europe', country: 'Armenia', standardRate: 387.0 },
    { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', flag: '🇦🇿', decimals: 2, region: 'Europe', country: 'Azerbaijan', standardRate: 1.70 },
    { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br', flag: '🇧🇾', decimals: 2, region: 'Europe', country: 'Belarus', standardRate: 3.27 },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺', decimals: 2, region: 'Europe', country: 'Russia', standardRate: 91.5 },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', decimals: 2, region: 'Europe', country: 'Turkey', isPopular: true, standardRate: 34.1 },

    // Middle East
    { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', flag: '🇮🇱', decimals: 2, region: 'Middle East', country: 'Israel', isPopular: true, standardRate: 3.73 },
    { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', flag: '🇶🇦', decimals: 2, region: 'Middle East', country: 'Qatar', isPopular: true, standardRate: 3.64 },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', flag: '🇰🇼', decimals: 3, region: 'Middle East', country: 'Kuwait', isPopular: true, standardRate: 0.306 },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', flag: '🇧🇭', decimals: 3, region: 'Middle East', country: 'Bahrain', isPopular: true, standardRate: 0.376 },
    { code: 'OMR', name: 'Omani Rial', symbol: 'OMR', flag: '🇴🇲', decimals: 3, region: 'Middle East', country: 'Oman', isPopular: true, standardRate: 0.384 },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JD', flag: '🇯🇴', decimals: 3, region: 'Middle East', country: 'Jordan', standardRate: 0.709 },
    { code: 'LBP', name: 'Lebanese Pound', symbol: 'L£', flag: '🇱🇧', decimals: 2, region: 'Middle East', country: 'Lebanon', standardRate: 89500.0 },
    { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ID', flag: '🇮🇶', decimals: 3, region: 'Middle East', country: 'Iraq', standardRate: 1310.0 },
    { code: 'IRR', name: 'Iranian Rial', symbol: 'IRR', flag: '🇮🇷', decimals: 0, region: 'Middle East', country: 'Iran', standardRate: 42000.0 },
    { code: 'YER', name: 'Yemeni Rial', symbol: 'YR', flag: '🇾🇪', decimals: 2, region: 'Middle East', country: 'Yemen', standardRate: 250.0 },

    // Asia & Pacific
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰', decimals: 2, region: 'Asia & Pacific', country: 'Hong Kong', isPopular: true, standardRate: 7.79 },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', decimals: 0, region: 'Asia & Pacific', country: 'South Korea', isPopular: true, standardRate: 1335.0 },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', decimals: 2, region: 'Asia & Pacific', country: 'New Zealand', isPopular: true, standardRate: 1.625 },
    { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼', decimals: 2, region: 'Asia & Pacific', country: 'Taiwan', standardRate: 32.1 },
    { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', decimals: 2, region: 'Asia & Pacific', country: 'Thailand', isPopular: true, standardRate: 33.7 },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', decimals: 2, region: 'Asia & Pacific', country: 'Malaysia', isPopular: true, standardRate: 4.34 },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', decimals: 0, region: 'Asia & Pacific', country: 'Indonesia', isPopular: true, standardRate: 15450.0 },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', decimals: 2, region: 'Asia & Pacific', country: 'Philippines', isPopular: true, standardRate: 56.2 },
    { code: 'VND', name: 'Vietnamese Đồng', symbol: '₫', flag: '🇻🇳', decimals: 0, region: 'Asia & Pacific', country: 'Vietnam', isPopular: true, standardRate: 24750.0 },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰', decimals: 2, region: 'Asia & Pacific', country: 'Pakistan', isPopular: true, standardRate: 278.5 },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩', decimals: 2, region: 'Asia & Pacific', country: 'Bangladesh', isPopular: true, standardRate: 119.8 },
    { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', flag: '🇱🇰', decimals: 2, region: 'Asia & Pacific', country: 'Sri Lanka', standardRate: 301.5 },
    { code: 'NPR', name: 'Nepalese Rupee', symbol: 'रू', flag: '🇳🇵', decimals: 2, region: 'Asia & Pacific', country: 'Nepal', standardRate: 134.2 },
    { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', flag: '🇲🇲', decimals: 2, region: 'Asia & Pacific', country: 'Myanmar', standardRate: 2100.0 },
    { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', flag: '🇰🇭', decimals: 2, region: 'Asia & Pacific', country: 'Cambodia', standardRate: 4080.0 },
    { code: 'LAK', name: 'Lao Kip', symbol: '₭', flag: '🇱🇦', decimals: 0, region: 'Asia & Pacific', country: 'Laos', standardRate: 21950.0 },
    { code: 'MNT', name: 'Mongolian Tögrög', symbol: '₮', flag: '🇲🇳', decimals: 2, region: 'Asia & Pacific', country: 'Mongolia', standardRate: 3385.0 },
    { code: 'BND', name: 'Brunei Dollar', symbol: 'B$', flag: '🇧🇳', decimals: 2, region: 'Asia & Pacific', country: 'Brunei', standardRate: 1.305 },
    { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$', flag: '🇲🇴', decimals: 2, region: 'Asia & Pacific', country: 'Macau', standardRate: 8.03 },
    { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf', flag: '🇲🇻', decimals: 2, region: 'Asia & Pacific', country: 'Maldives', standardRate: 15.42 },
    { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', flag: '🇦🇫', decimals: 2, region: 'Asia & Pacific', country: 'Afghanistan', standardRate: 70.8 },
    { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', flag: '🇰🇿', decimals: 2, region: 'Asia & Pacific', country: 'Kazakhstan', standardRate: 481.5 },
    { code: 'UZS', name: 'Uzbekistani Som', symbol: 'soʻm', flag: '🇺🇿', decimals: 2, region: 'Asia & Pacific', country: 'Uzbekistan', standardRate: 12690.0 },
    { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅМ', flag: '🇹🇯', decimals: 2, region: 'Asia & Pacific', country: 'Tajikistan', standardRate: 10.65 },
    { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'с', flag: '🇰🇬', decimals: 2, region: 'Asia & Pacific', country: 'Kyrgyzstan', standardRate: 85.3 },
    { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$', flag: '🇫🇯', decimals: 2, region: 'Asia & Pacific', country: 'Fiji', standardRate: 2.24 },
    { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', flag: '🇵🇬', decimals: 2, region: 'Asia & Pacific', country: 'Papua New Guinea', standardRate: 3.96 },
    { code: 'WST', name: 'Samoan Tālā', symbol: 'WS$', flag: '🇼🇸', decimals: 2, region: 'Asia & Pacific', country: 'Samoa', standardRate: 2.76 },
    { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', flag: '🇻🇺', decimals: 0, region: 'Asia & Pacific', country: 'Vanuatu', standardRate: 119.5 },
    { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$', flag: '🇸🇧', decimals: 2, region: 'Asia & Pacific', country: 'Solomon Islands', standardRate: 8.45 },
    { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$', flag: '🇹🇴', decimals: 2, region: 'Asia & Pacific', country: 'Tonga', standardRate: 2.35 },

    // Americas
    { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', flag: '🇲🇽', decimals: 2, region: 'Americas', country: 'Mexico', isPopular: true, standardRate: 19.85 },
    { code: 'COP', name: 'Colombian Peso', symbol: 'COL$', flag: '🇨🇴', decimals: 2, region: 'Americas', country: 'Colombia', isPopular: true, standardRate: 4230.0 },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷', decimals: 2, region: 'Americas', country: 'Argentina', isPopular: true, standardRate: 955.0 },
    { code: 'CLP', name: 'Chilean Peso', symbol: 'CLP$', flag: '🇨🇱', decimals: 0, region: 'Americas', country: 'Chile', isPopular: true, standardRate: 935.0 },
    { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/.', flag: '🇵🇪', decimals: 2, region: 'Americas', country: 'Peru', isPopular: true, standardRate: 3.79 },
    { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', flag: '🇺🇾', decimals: 2, region: 'Americas', country: 'Uruguay', standardRate: 40.5 },
    { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲', flag: '🇵🇾', decimals: 0, region: 'Americas', country: 'Paraguay', standardRate: 7680.0 },
    { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.', flag: '🇧🇴', decimals: 2, region: 'Americas', country: 'Bolivia', standardRate: 6.91 },
    { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', flag: '🇨🇷', decimals: 2, region: 'Americas', country: 'Costa Rica', standardRate: 520.0 },
    { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', flag: '🇩🇴', decimals: 2, region: 'Americas', country: 'Dominican Republic', standardRate: 59.8 },
    { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', flag: '🇬🇹', decimals: 2, region: 'Americas', country: 'Guatemala', standardRate: 7.74 },
    { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', flag: '🇭🇳', decimals: 2, region: 'Americas', country: 'Honduras', standardRate: 24.8 },
    { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', flag: '🇳🇮', decimals: 2, region: 'Americas', country: 'Nicaragua', standardRate: 36.8 },
    { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', flag: '🇵🇦', decimals: 2, region: 'Americas', country: 'Panama', standardRate: 1.0 },
    { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', flag: '🇯🇲', decimals: 2, region: 'Americas', country: 'Jamaica', standardRate: 157.5 },
    { code: 'TTD', name: 'Trinidad & Tobago Dollar', symbol: 'TT$', flag: '🇹🇹', decimals: 2, region: 'Americas', country: 'Trinidad & Tobago', standardRate: 6.78 },
    { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$', flag: '🇧🇧', decimals: 2, region: 'Americas', country: 'Barbados', standardRate: 2.0 },
    { code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$', flag: '🇧🇸', decimals: 2, region: 'Americas', country: 'Bahamas', standardRate: 1.0 },
    { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$', flag: '🇧🇿', decimals: 2, region: 'Americas', country: 'Belize', standardRate: 2.0 },
    { code: 'HTG', name: 'Haitian Gourde', symbol: 'G', flag: '🇭🇹', decimals: 2, region: 'Americas', country: 'Haiti', standardRate: 131.8 },
    { code: 'GYD', name: 'Guyanese Dollar', symbol: 'G$', flag: '🇬🇾', decimals: 2, region: 'Americas', country: 'Guyana', standardRate: 209.0 },
    { code: 'SRD', name: 'Surinamese Dollar', symbol: 'Sr$', flag: '🇸🇷', decimals: 2, region: 'Americas', country: 'Suriname', standardRate: 29.5 },
    { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$', flag: '🇦🇬', decimals: 2, region: 'Americas', country: 'OECS (Caribbean)', standardRate: 2.70 },
    { code: 'AWG', name: 'Aruban Florin', symbol: 'Afl.', flag: '🇦🇼', decimals: 2, region: 'Americas', country: 'Aruba', standardRate: 1.80 },
    { code: 'ANG', name: 'Netherlands Antillean Guilder', symbol: 'NAƒ', flag: '🇨🇼', decimals: 2, region: 'Americas', country: 'Curaçao & Sint Maarten', standardRate: 1.80 },
    { code: 'BMD', name: 'Bermudian Dollar', symbol: 'BD$', flag: '🇧🇲', decimals: 2, region: 'Americas', country: 'Bermuda', standardRate: 1.0 },
    { code: 'KYD', name: 'Cayman Islands Dollar', symbol: 'CI$', flag: '🇰🇾', decimals: 2, region: 'Americas', country: 'Cayman Islands', standardRate: 0.833 },
    { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.S', flag: '🇻🇪', decimals: 2, region: 'Americas', country: 'Venezuela', standardRate: 36.7 }
];

// Lookup index map by code for O(1) retrieval
export const CURRENCY_MAP = new Map<string, CurrencyInfo>(
    ALL_CURRENCIES.map(c => [c.code.toUpperCase(), c])
);

// Fallback lookup
export const getCurrencyInfo = (code: string): CurrencyInfo => {
    return CURRENCY_MAP.get(code.toUpperCase()) || {
        code: code.toUpperCase(),
        name: code.toUpperCase(),
        symbol: code.toUpperCase(),
        flag: '🌐',
        decimals: 2,
        region: 'Americas',
        country: 'Global',
        standardRate: 1.0
    };
};
