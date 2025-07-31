import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  FormHelperText,
  IconButton,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import './Register.css';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CountryFlag from 'react-country-flag';
import axios from 'axios';
import CheckCircle from '@mui/icons-material/CheckCircle';

const buyerTypes = [
  'Wholesale',
  'Retail', 
  'Online'
];

// Comprehensive country data with emoji flags and phone codes (alphabetically ordered)
const countries = [
  { name: 'Afghanistan', flag: '🇦🇫', code: 'AF', phoneCode: '93' },
  { name: 'Albania', flag: '🇦🇱', code: 'AL', phoneCode: '355' },
  { name: 'Algeria', flag: '🇩🇿', code: 'DZ', phoneCode: '213' },
  { name: 'Andorra', flag: '🇦🇩', code: 'AD', phoneCode: '376' },
  { name: 'Angola', flag: '🇦🇴', code: 'AO', phoneCode: '244' },
  { name: 'Antigua and Barbuda', flag: '🇦🇬', code: 'AG', phoneCode: '1268' },
  { name: 'Argentina', flag: '🇦🇷', code: 'AR', phoneCode: '54' },
  { name: 'Armenia', flag: '🇦🇲', code: 'AM', phoneCode: '374' },
  { name: 'Australia', flag: '🇦🇺', code: 'AU', phoneCode: '61' },
  { name: 'Austria', flag: '🇦🇹', code: 'AT', phoneCode: '43' },
  { name: 'Azerbaijan', flag: '🇦🇿', code: 'AZ', phoneCode: '994' },
  { name: 'Bahamas', flag: '🇧🇸', code: 'BS', phoneCode: '1242' },
  { name: 'Bahrain', flag: '🇧🇭', code: 'BH', phoneCode: '973' },
  { name: 'Bangladesh', flag: '🇧🇩', code: 'BD', phoneCode: '880' },
  { name: 'Barbados', flag: '🇧🇧', code: 'BB', phoneCode: '1246' },
  { name: 'Belarus', flag: '🇧🇾', code: 'BY', phoneCode: '375' },
  { name: 'Belgium', flag: '🇧🇪', code: 'BE', phoneCode: '32' },
  { name: 'Belize', flag: '🇧🇿', code: 'BZ', phoneCode: '501' },
  { name: 'Benin', flag: '🇧🇯', code: 'BJ', phoneCode: '229' },
  { name: 'Bhutan', flag: '🇧🇹', code: 'BT', phoneCode: '975' },
  { name: 'Bolivia', flag: '🇧🇴', code: 'BO', phoneCode: '591' },
  { name: 'Bosnia and Herzegovina', flag: '🇧🇦', code: 'BA', phoneCode: '387' },
  { name: 'Botswana', flag: '🇧🇼', code: 'BW', phoneCode: '267' },
  { name: 'Brazil', flag: '🇧🇷', code: 'BR', phoneCode: '55' },
  { name: 'Brunei', flag: '🇧🇳', code: 'BN', phoneCode: '673' },
  { name: 'Bulgaria', flag: '🇧🇬', code: 'BG', phoneCode: '359' },
  { name: 'Burkina Faso', flag: '🇧🇫', code: 'BF', phoneCode: '226' },
  { name: 'Burundi', flag: '🇧🇮', code: 'BI', phoneCode: '257' },
  { name: 'Cambodia', flag: '🇰🇭', code: 'KH', phoneCode: '855' },
  { name: 'Cameroon', flag: '🇨🇲', code: 'CM', phoneCode: '237' },
  { name: 'Canada', flag: '🇨🇦', code: 'CA', phoneCode: '1' },
  { name: 'Cape Verde', flag: '🇨🇻', code: 'CV', phoneCode: '238' },
  { name: 'Central African Republic', flag: '🇨🇫', code: 'CF', phoneCode: '236' },
  { name: 'Chad', flag: '🇹🇩', code: 'TD', phoneCode: '235' },
  { name: 'Chile', flag: '🇨🇱', code: 'CL', phoneCode: '56' },
  { name: 'China', flag: '🇨🇳', code: 'CN', phoneCode: '86' },
  { name: 'Colombia', flag: '🇨🇴', code: 'CO', phoneCode: '57' },
  { name: 'Comoros', flag: '🇰🇲', code: 'KM', phoneCode: '269' },
  { name: 'Costa Rica', flag: '🇨🇷', code: 'CR', phoneCode: '506' },
  { name: 'Croatia', flag: '🇭🇷', code: 'HR', phoneCode: '385' },
  { name: 'Cuba', flag: '🇨🇺', code: 'CU', phoneCode: '53' },
  { name: 'Cyprus', flag: '🇨🇾', code: 'CY', phoneCode: '357' },
  { name: 'Czech Republic', flag: '🇨🇿', code: 'CZ', phoneCode: '420' },
  { name: 'Democratic Republic of the Congo', flag: '🇨🇩', code: 'CD', phoneCode: '243' },
  { name: 'Denmark', flag: '🇩🇰', code: 'DK', phoneCode: '45' },
  { name: 'Djibouti', flag: '🇩🇯', code: 'DJ', phoneCode: '253' },
  { name: 'Dominica', flag: '🇩🇲', code: 'DM', phoneCode: '1767' },
  { name: 'Dominican Republic', flag: '🇩🇴', code: 'DO', phoneCode: '1809' },
  { name: 'Ecuador', flag: '🇪🇨', code: 'EC', phoneCode: '593' },
  { name: 'Egypt', flag: '🇪🇬', code: 'EG', phoneCode: '20' },
  { name: 'El Salvador', flag: '🇸🇻', code: 'SV', phoneCode: '503' },
  { name: 'Equatorial Guinea', flag: '🇬🇶', code: 'GQ', phoneCode: '240' },
  { name: 'Eritrea', flag: '🇪🇷', code: 'ER', phoneCode: '291' },
  { name: 'Estonia', flag: '🇪🇪', code: 'EE', phoneCode: '372' },
  { name: 'Eswatini', flag: '🇸🇿', code: 'SZ', phoneCode: '268' },
  { name: 'Ethiopia', flag: '🇪🇹', code: 'ET', phoneCode: '251' },
  { name: 'Fiji', flag: '🇫🇯', code: 'FJ', phoneCode: '679' },
  { name: 'Finland', flag: '🇫🇮', code: 'FI', phoneCode: '358' },
  { name: 'France', flag: '🇫🇷', code: 'FR', phoneCode: '33' },
  { name: 'Gabon', flag: '🇬🇦', code: 'GA', phoneCode: '241' },
  { name: 'Gambia', flag: '🇬🇲', code: 'GM', phoneCode: '220' },
  { name: 'Georgia', flag: '🇬🇪', code: 'GE', phoneCode: '995' },
  { name: 'Germany', flag: '🇩🇪', code: 'DE', phoneCode: '49' },
  { name: 'Ghana', flag: '🇬🇭', code: 'GH', phoneCode: '233' },
  { name: 'Greece', flag: '🇬🇷', code: 'GR', phoneCode: '30' },
  { name: 'Grenada', flag: '🇬🇩', code: 'GD', phoneCode: '1473' },
  { name: 'Guatemala', flag: '🇬🇹', code: 'GT', phoneCode: '502' },
  { name: 'Guinea', flag: '🇬🇳', code: 'GN', phoneCode: '224' },
  { name: 'Guinea-Bissau', flag: '🇬🇼', code: 'GW', phoneCode: '245' },
  { name: 'Guyana', flag: '🇬🇾', code: 'GY', phoneCode: '592' },
  { name: 'Haiti', flag: '🇭🇹', code: 'HT', phoneCode: '509' },
  { name: 'Honduras', flag: '🇭🇳', code: 'HN', phoneCode: '504' },
  { name: 'Hungary', flag: '🇭🇺', code: 'HU', phoneCode: '36' },
  { name: 'Iceland', flag: '🇮🇸', code: 'IS', phoneCode: '354' },
  { name: 'India', flag: '🇮🇳', code: 'IN', phoneCode: '91' },
  { name: 'Indonesia', flag: '🇮🇩', code: 'ID', phoneCode: '62' },
  { name: 'Iran', flag: '🇮🇷', code: 'IR', phoneCode: '98' },
  { name: 'Iraq', flag: '🇮🇶', code: 'IQ', phoneCode: '964' },
  { name: 'Ireland', flag: '🇮🇪', code: 'IE', phoneCode: '353' },
  { name: 'Israel', flag: '🇮🇱', code: 'IL', phoneCode: '972' },
  { name: 'Italy', flag: '🇮🇹', code: 'IT', phoneCode: '39' },
  { name: 'Ivory Coast', flag: '🇨🇮', code: 'CI', phoneCode: '225' },
  { name: 'Jamaica', flag: '🇯🇲', code: 'JM', phoneCode: '1876' },
  { name: 'Japan', flag: '🇯🇵', code: 'JP', phoneCode: '81' },
  { name: 'Jordan', flag: '🇯🇴', code: 'JO', phoneCode: '962' },
  { name: 'Kazakhstan', flag: '🇰🇿', code: 'KZ', phoneCode: '7' },
  { name: 'Kenya', flag: '🇰🇪', code: 'KE', phoneCode: '254' },
  { name: 'Kuwait', flag: '🇰🇼', code: 'KW', phoneCode: '965' },
  { name: 'Kyrgyzstan', flag: '🇰🇬', code: 'KG', phoneCode: '996' },
  { name: 'Laos', flag: '🇱🇦', code: 'LA', phoneCode: '856' },
  { name: 'Latvia', flag: '🇱🇻', code: 'LV', phoneCode: '371' },
  { name: 'Lebanon', flag: '🇱🇧', code: 'LB', phoneCode: '961' },
  { name: 'Lesotho', flag: '🇱🇸', code: 'LS', phoneCode: '266' },
  { name: 'Liberia', flag: '🇱🇷', code: 'LR', phoneCode: '231' },
  { name: 'Libya', flag: '🇱🇾', code: 'LY', phoneCode: '218' },
  { name: 'Liechtenstein', flag: '🇱🇮', code: 'LI', phoneCode: '423' },
  { name: 'Lithuania', flag: '🇱🇹', code: 'LT', phoneCode: '370' },
  { name: 'Luxembourg', flag: '🇱🇺', code: 'LU', phoneCode: '352' },
  { name: 'Madagascar', flag: '🇲🇬', code: 'MG', phoneCode: '261' },
  { name: 'Malawi', flag: '🇲🇼', code: 'MW', phoneCode: '265' },
  { name: 'Malaysia', flag: '🇲🇾', code: 'MY', phoneCode: '60' },
  { name: 'Maldives', flag: '🇲🇻', code: 'MV', phoneCode: '960' },
  { name: 'Mali', flag: '🇲🇱', code: 'ML', phoneCode: '223' },
  { name: 'Malta', flag: '🇲🇹', code: 'MT', phoneCode: '356' },
  { name: 'Mauritania', flag: '🇲🇷', code: 'MR', phoneCode: '222' },
  { name: 'Mauritius', flag: '🇲🇺', code: 'MU', phoneCode: '230' },
  { name: 'Mexico', flag: '🇲🇽', code: 'MX', phoneCode: '52' },
  { name: 'Moldova', flag: '🇲🇩', code: 'MD', phoneCode: '373' },
  { name: 'Monaco', flag: '🇲🇨', code: 'MC', phoneCode: '377' },
  { name: 'Mongolia', flag: '🇲🇳', code: 'MN', phoneCode: '976' },
  { name: 'Montenegro', flag: '🇲🇪', code: 'ME', phoneCode: '382' },
  { name: 'Morocco', flag: '🇲🇦', code: 'MA', phoneCode: '212' },
  { name: 'Mozambique', flag: '🇲🇿', code: 'MZ', phoneCode: '258' },
  { name: 'Myanmar', flag: '🇲🇲', code: 'MM', phoneCode: '95' },
  { name: 'Namibia', flag: '🇳🇦', code: 'NA', phoneCode: '264' },
  { name: 'Nepal', flag: '🇳🇵', code: 'NP', phoneCode: '977' },
  { name: 'Netherlands', flag: '🇳🇱', code: 'NL', phoneCode: '31' },
  { name: 'New Zealand', flag: '🇳🇿', code: 'NZ', phoneCode: '64' },
  { name: 'Nicaragua', flag: '🇳🇮', code: 'NI', phoneCode: '505' },
  { name: 'Niger', flag: '🇳🇪', code: 'NE', phoneCode: '227' },
  { name: 'Nigeria', flag: '🇳🇬', code: 'NG', phoneCode: '234' },
  { name: 'North Korea', flag: '🇰🇵', code: 'KP', phoneCode: '850' },
  { name: 'Norway', flag: '🇳🇴', code: 'NO', phoneCode: '47' },
  { name: 'Oman', flag: '🇴🇲', code: 'OM', phoneCode: '968' },
  { name: 'Pakistan', flag: '🇵🇰', code: 'PK', phoneCode: '92' },
  { name: 'Panama', flag: '🇵🇦', code: 'PA', phoneCode: '507' },
  { name: 'Papua New Guinea', flag: '🇵🇬', code: 'PG', phoneCode: '675' },
  { name: 'Paraguay', flag: '🇵🇾', code: 'PY', phoneCode: '595' },
  { name: 'Peru', flag: '🇵🇪', code: 'PE', phoneCode: '51' },
  { name: 'Philippines', flag: '🇵🇭', code: 'PH', phoneCode: '63' },
  { name: 'Poland', flag: '🇵🇱', code: 'PL', phoneCode: '48' },
  { name: 'Portugal', flag: '🇵🇹', code: 'PT', phoneCode: '351' },
  { name: 'Qatar', flag: '🇶🇦', code: 'QA', phoneCode: '974' },
  { name: 'Republic of the Congo', flag: '🇨🇬', code: 'CG', phoneCode: '242' },
  { name: 'Romania', flag: '🇷🇴', code: 'RO', phoneCode: '40' },
  { name: 'Russia', flag: '🇷🇺', code: 'RU', phoneCode: '7' },
  { name: 'Rwanda', flag: '🇷🇼', code: 'RW', phoneCode: '250' },
  { name: 'Saint Kitts and Nevis', flag: '🇰🇳', code: 'KN', phoneCode: '1869' },
  { name: 'Saint Lucia', flag: '🇱🇨', code: 'LC', phoneCode: '1758' },
  { name: 'Saint Vincent and the Grenadines', flag: '🇻🇨', code: 'VC', phoneCode: '1784' },
  { name: 'San Marino', flag: '🇸🇲', code: 'SM', phoneCode: '378' },
  { name: 'São Tomé and Príncipe', flag: '🇸🇹', code: 'ST', phoneCode: '239' },
  { name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA', phoneCode: '966' },
  { name: 'Senegal', flag: '🇸🇳', code: 'SN', phoneCode: '221' },
  { name: 'Serbia', flag: '🇷🇸', code: 'RS', phoneCode: '381' },
  { name: 'Seychelles', flag: '🇸🇨', code: 'SC', phoneCode: '248' },
  { name: 'Sierra Leone', flag: '🇸🇱', code: 'SL', phoneCode: '232' },
  { name: 'Singapore', flag: '🇸🇬', code: 'SG', phoneCode: '65' },
  { name: 'Slovakia', flag: '🇸🇰', code: 'SK', phoneCode: '421' },
  { name: 'Slovenia', flag: '🇸🇮', code: 'SI', phoneCode: '386' },
  { name: 'Somalia', flag: '🇸🇴', code: 'SO', phoneCode: '252' },
  { name: 'South Africa', flag: '🇿🇦', code: 'ZA', phoneCode: '27' },
  { name: 'South Korea', flag: '🇰🇷', code: 'KR', phoneCode: '82' },
  { name: 'South Sudan', flag: '🇸🇸', code: 'SS', phoneCode: '211' },
  { name: 'Spain', flag: '🇪🇸', code: 'ES', phoneCode: '34' },
  { name: 'Sri Lanka', flag: '🇱🇰', code: 'LK', phoneCode: '94' },
  { name: 'Sudan', flag: '🇸🇩', code: 'SD', phoneCode: '249' },
  { name: 'Suriname', flag: '🇸🇷', code: 'SR', phoneCode: '597' },
  { name: 'Sweden', flag: '🇸🇪', code: 'SE', phoneCode: '46' },
  { name: 'Switzerland', flag: '🇨🇭', code: 'CH', phoneCode: '41' },
  { name: 'Syria', flag: '🇸🇾', code: 'SY', phoneCode: '963' },
  { name: 'Taiwan', flag: '🇹🇼', code: 'TW', phoneCode: '886' },
  { name: 'Tajikistan', flag: '🇹🇯', code: 'TJ', phoneCode: '992' },
  { name: 'Tanzania', flag: '🇹🇿', code: 'TZ', phoneCode: '255' },
  { name: 'Thailand', flag: '🇹🇭', code: 'TH', phoneCode: '66' },
  { name: 'Tunisia', flag: '🇹🇳', code: 'TN', phoneCode: '216' },
  { name: 'Turkey', flag: '🇹🇷', code: 'TR', phoneCode: '90' },
  { name: 'Turkmenistan', flag: '🇹🇲', code: 'TM', phoneCode: '993' },
  { name: 'Uganda', flag: '🇺🇬', code: 'UG', phoneCode: '256' },
  { name: 'Ukraine', flag: '🇺🇦', code: 'UA', phoneCode: '380' },
  { name: 'United Arab Emirates', flag: '🇦🇪', code: 'AE', phoneCode: '971' },
  { name: 'United Kingdom', flag: '🇬🇧', code: 'GB', phoneCode: '44' },
  { name: 'United States', flag: '🇺🇸', code: 'US', phoneCode: '1' },
  { name: 'Uruguay', flag: '🇺🇾', code: 'UY', phoneCode: '598' },
  { name: 'Uzbekistan', flag: '🇺🇿', code: 'UZ', phoneCode: '998' },
  { name: 'Vatican City', flag: '🇻🇦', code: 'VA', phoneCode: '379' },
  { name: 'Venezuela', flag: '🇻🇪', code: 'VE', phoneCode: '58' },
  { name: 'Vietnam', flag: '🇻🇳', code: 'VN', phoneCode: '84' },
  { name: 'Yemen', flag: '🇾🇪', code: 'YE', phoneCode: '967' },
  { name: 'Zambia', flag: '🇿🇲', code: 'ZM', phoneCode: '260' },
  { name: 'Zimbabwe', flag: '🇿🇼', code: 'ZW', phoneCode: '263' }
];





const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const Register = () => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submission guard
  const [touchedFields, setTouchedFields] = useState({}); // Track which fields have been touched
  const [showConfirmation, setShowConfirmation] = useState(false);

  // 1. Use mode: 'onSubmit' for classic form behavior
  const {
    register: registerUserForm,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors }
  } = useForm({
    mode: 'onSubmit', // CHANGED from 'onChange' to 'onSubmit'
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      phoneCountryCode: 'ae',
      companyName: '',
      companyAddress: {
        street: '',
        city: '',
        country: ''
      },
      buyerType: '',
      password: '',
      confirmPassword: ''
    }
  });

  // 2. Add deep logs to render
  if (process.env.NODE_ENV === 'development') {
    console.log('[Register.js] Rendered. error:', error, '| formSubmitted:', formSubmitted, '| isSubmitting:', isSubmitting);
  }

  const handleRefreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
  };

  const checkEmailAvailability = async (email) => {
    if (!email || email.length < 3) {
      setEmailAvailable(null);
      return;
    }

    setEmailChecking(true);
    try {
      const response = await axios.post('/api/auth/check-email', { email });
      setEmailAvailable(response.data.available);
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailAvailable(null);
    } finally {
      setEmailChecking(false);
    }
  };

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'email' && value.email) {
        const timeoutId = setTimeout(() => {
          checkEmailAvailability(value.email);
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // 3. Add logs to onSubmit
  const onSubmit = async (data) => {
    console.log('[Register.js] onSubmit called. Data:', data);
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log('[Register.js] Submission already in progress.');
      return;
    }

    // Set form submitted immediately to trigger validation display
    setFormSubmitted(true);
    setIsSubmitting(true);
    
    // Scroll to top to show errors
    window.scrollTo({ top: 0, behavior: 'smooth' });



    // Debug: Log the form data
    console.log('=== FORM SUBMISSION START ===');
    console.log('Form data received:', data);
    console.log('Form data keys:', Object.keys(data));
    console.log('Company address data:', data.companyAddress);
    console.log('Nested field values:', {
      'companyAddress.street': data['companyAddress.street'],
      'companyAddress.city': data['companyAddress.city'],
      'companyAddress.country': data['companyAddress.country']
    });
    console.log('Form submitted timestamp:', new Date().toISOString());

    // Normalize the data to handle both nested and flat structures
    const normalizedData = {
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      phoneCountryCode: data.phoneCountryCode || 'ae',
      companyName: data.companyName || '',
      companyAddress: {
        street: data.companyAddress?.street || data['companyAddress.street'] || '',
        city: data.companyAddress?.city || data['companyAddress.city'] || '',
        country: data.companyAddress?.country || data['companyAddress.country'] || ''
      },
      buyerType: data.buyerType || '',
      password: data.password || '',
      confirmPassword: data.confirmPassword || ''
    };

    console.log('Normalized data:', normalizedData);

    // Validate all fields
    const errors = [];

    if (!normalizedData.name || normalizedData.name.trim() === '') {
      errors.push('Full name is required');
    } else if (/[0-9]/.test(normalizedData.name)) {
      errors.push('Full name cannot contain numbers');
    }

    if (!normalizedData.email || normalizedData.email.trim() === '') {
      errors.push('Email address is required');
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(normalizedData.email)) {
      errors.push('Invalid email format');
    }

    if (!normalizedData.phone || normalizedData.phone.trim() === '') {
      errors.push('Phone number is required');
    } else if (/[a-zA-Z]/.test(normalizedData.phone)) {
      errors.push('Phone number cannot contain letters');
    }

    if (!normalizedData.companyName || normalizedData.companyName.trim() === '') {
      errors.push('Company name is required');
    }

    if (!normalizedData.companyAddress.street || normalizedData.companyAddress.street.trim() === '') {
      errors.push('Company street address is required');
    }

    if (!normalizedData.companyAddress.city || normalizedData.companyAddress.city.trim() === '') {
      errors.push('Company city is required');
    }

    if (!normalizedData.companyAddress.country || normalizedData.companyAddress.country.trim() === '') {
      errors.push('Company country is required');
    }

    if (!normalizedData.buyerType || normalizedData.buyerType.trim() === '') {
      errors.push('Buyer type is required');
    }

    if (!normalizedData.password || normalizedData.password.trim() === '') {
      errors.push('Password is required');
    } else if (normalizedData.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (!normalizedData.confirmPassword || normalizedData.confirmPassword.trim() === '') {
      errors.push('Password confirmation is required');
    }

    if (normalizedData.password !== normalizedData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    if (!acceptTerms) {
      errors.push('You must accept the terms of service to continue');
    }

    if (captchaInput.toUpperCase() !== captchaCode) {
      errors.push('Please enter the correct verification code');
    }

    if (emailAvailable === false) {
      errors.push('Email is already taken');
    }

    // If there are validation errors, show them and return
    if (errors.length > 0) {
      console.log('Validation errors found:', errors);
      const errorMessage = errors.length === 1 
        ? 'Please fix the highlighted error' 
        : 'Please fix the highlighted errors';
      console.log('Setting error message:', errorMessage);
      setError(errorMessage);
      setIsSubmitting(false);
      return;
    }

    // Clear any previous errors since validation passed
    setError('');
    setLoading(true);

    try {
      // Combine country code with phone number
      const selectedCountry = countries.find(c => c.code.toLowerCase() === normalizedData.phoneCountryCode);
      const fullPhoneNumber = selectedCountry ? `+${selectedCountry.phoneCode}${normalizedData.phone}` : normalizedData.phone;
      
      // Use normalized data for registration
      const registrationData = {
        ...normalizedData,
        phone: fullPhoneNumber
      };

      console.log('Registration data being sent:', registrationData);

      const result = await register(registrationData);
      
      if (result.success) {
        setShowConfirmation(true);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
      console.log('=== FORM SUBMISSION END ===');
    }
  };

  // 4. Add logs to onError
  const onError = (formErrors) => {
    console.log('[Register.js] onError called. Errors:', formErrors);
    // Set form submitted immediately to trigger validation display
    setFormSubmitted(true);
    setError('Please fix the highlighted errors');
    // Optionally, scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(watch('password'));

  // Fix regex pattern to remove unnecessary escape characters
  const phoneRegex = /^[+]?[0-9\s\-()]{7,}$/;

  // Function to check if a field has an error (show errors immediately for better UX)
  const hasFieldError = (fieldName, value) => {
    // For real-time validation, show errors immediately when user types invalid content
    if (!value || value.trim() === '') {
      return formSubmitted || touchedFields[fieldName];
    }
    
    switch (fieldName) {
      case 'email':
        return !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);
      case 'confirmPassword':
        const password = watch('password');
        return password && value !== password;
      case 'name':
        return /[0-9]/.test(value);
      case 'phone':
        return /[a-zA-Z]/.test(value);
      case 'companyAddress.street':
      case 'companyAddress.city':
      case 'companyAddress.country':
        return !value || value.trim() === '';
      case 'companyName':
      case 'password':
        return !value || value.trim() === '';
      case 'buyerType':
        return !value || value.trim() === '';
      default:
        return false;
    }
  };

  // Function to get field error message
  const getFieldErrorMessage = (fieldName, value) => {
    // For real-time validation, show errors immediately when user types invalid content
    if (!value || value.trim() === '') {
      if (formSubmitted || touchedFields[fieldName]) {
        switch (fieldName) {
          case 'name': return 'Full name is required';
          case 'email': return 'Email address is required';
          case 'phone': return 'Phone number is required';
          case 'companyName': return 'Company name is required';
          case 'companyAddress.street': return 'Street address is required';
          case 'companyAddress.city': return 'City is required';
          case 'companyAddress.country': return 'Country is required';
          case 'buyerType': return 'Buyer type is required';
          case 'password': return 'Password is required';
          case 'confirmPassword': return 'Password confirmation is required';
          default: return 'This field is required';
        }
      }
      return '';
    }
    
    // Real-time validation for format errors
    switch (fieldName) {
      case 'email':
        return !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ? 'Invalid email format' : '';
      case 'confirmPassword':
        const password = watch('password');
        return password && value !== password ? 'Passwords do not match' : '';
      case 'name':
        return /[0-9]/.test(value) ? 'Full name cannot contain numbers' : '';
      case 'phone':
        return /[a-zA-Z]/.test(value) ? 'Phone number cannot contain letters' : '';
      default:
        return '';
    }
  };

  // Helper function to get field value (handles nested fields)
  const getFieldValue = (fieldName) => {
    if (fieldName.includes('.')) {
      const [parent, child] = fieldName.split('.');
      const parentValue = watch(parent);
      return parentValue ? parentValue[child] || '' : '';
    }
    return watch(fieldName) || '';
  };

  // Function to mark a field as touched
  const markFieldAsTouched = (fieldName) => {
    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  return (
    <Box className="register-page">
      {showConfirmation ? (
        <Container component="main" maxWidth="sm">
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: '60vh',
            }}
          >
            <Paper elevation={3} sx={{
              padding: 4,
              width: '100%',
              borderRadius: '20px',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              animation: 'slideIn 0.6s ease-out',
            }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 12px 40px rgba(40, 167, 69, 0.4)',
                    animation: 'pulse 2s infinite',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      width: '120%',
                      height: '120%',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      opacity: 0.3,
                      animation: 'ripple 2s infinite',
                    },
                  }}
                >
                  <CheckCircle sx={{ fontSize: 50, color: 'white' }} />
                </Box>
                <Typography component="h1" variant="h3" gutterBottom sx={{
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                  mb: 2,
                }}>
                  Application Submitted
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Your application has been submitted. We’ll review it and notify you once approved.
                </Typography>
                <Button variant="contained" color="primary" component={RouterLink} to="/login" sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                  },
                }}>
                  Back to Login
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      ) : (
        <Container component="main" maxWidth="md">
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Paper elevation={3} sx={{ 
              padding: 4, 
              width: '100%',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }}>
              <Typography component="h1" variant="h4" align="center" gutterBottom sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
              }}>
                Buyer Registration
              </Typography>
              
              {error && formSubmitted && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 2
                  }}
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}
              




              <Box component="form" onSubmit={handleSubmit(onSubmit, onError)} noValidate>
                <Grid container spacing={3}>
                  {/* Personal Information */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{
                      color: '#1976d2',
                      fontWeight: '600',
                      borderBottom: '2px solid #e3f2fd',
                      pb: 1,
                      mb: 2
                    }}>
                      Personal Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      {...registerUserForm('name', { 
                        required: 'Full name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                      })}
                      fullWidth
                      label="Full Name *"
                      error={!!errors.name || hasFieldError('name', getFieldValue('name'))}
                      helperText={getFieldErrorMessage('name', getFieldValue('name')) || errors.name?.message}
                      onBlur={() => markFieldAsTouched('name')}
                      onChange={(e) => {
                        registerUserForm('name').onChange(e);
                        markFieldAsTouched('name');
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      {...registerUserForm('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      fullWidth
                      label="Email Address *"
                      type="email"
                      error={!!errors.email || emailAvailable === false || hasFieldError('email', getFieldValue('email'))}
                      helperText={
                        getFieldErrorMessage('email', getFieldValue('email')) ||
                        errors.email?.message || 
                        (emailChecking ? 'Checking...' : '') ||
                        (emailAvailable === false ? 'Email is already taken' : '') ||
                        (emailAvailable === true ? 'Email is available' : '')
                      }
                      onBlur={() => markFieldAsTouched('email')}
                      onChange={(e) => {
                        registerUserForm('email').onChange(e);
                        markFieldAsTouched('email');
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Phone Number *
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <FormControl sx={{ minWidth: 200 }} error={formSubmitted && !!errors.phoneCountryCode}>
                        <InputLabel>Country Code</InputLabel>
                        <Select
                          {...registerUserForm('phoneCountryCode', { 
                            required: 'Country code is required'
                          })}
                          value={watch('phoneCountryCode') || 'ae'}
                          onChange={(e) => {
                            setValue('phoneCountryCode', e.target.value);
                          }}
                          label="Country Code"
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#e0e0e0',
                              borderWidth: '1px'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#1976d2',
                              borderWidth: '1px'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#1976d2',
                              borderWidth: '2px'
                            }
                          }}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                                width: 'auto',
                                minWidth: '250px'
                              }
                            }
                          }}
                          renderValue={(selected) => {
                            const country = countries.find(c => c.code.toLowerCase() === selected);
                            return country ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CountryFlag countryCode={country.code} svg style={{ width: '1.2em', height: '1.2em' }} />
                                <Typography variant="body2">+{country.phoneCode}</Typography>
                              </Box>
                            ) : selected;
                          }}
                        >
                          {countries.map((country) => (
                            <MenuItem 
                              key={country.code} 
                              value={country.code.toLowerCase()}
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                minHeight: '40px',
                                py: 0.5,
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                }
                              }}
                            >
                              <CountryFlag countryCode={country.code} svg style={{ width: '1.2em', height: '1.2em' }} />
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                +{country.phoneCode}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                {country.name}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                        {formSubmitted && errors.phoneCountryCode && (
                          <FormHelperText>{errors.phoneCountryCode.message}</FormHelperText>
                        )}
                      </FormControl>
                      <TextField
                        {...registerUserForm('phone', {
                          required: 'Phone number is required',
                          pattern: phoneRegex,
                          minLength: {
                            value: 7,
                            message: 'Phone number must be at least 7 digits'
                          }
                        })}
                        fullWidth
                        label="Phone Number"
                        error={!!errors.phone || hasFieldError('phone', getFieldValue('phone'))}
                        helperText={getFieldErrorMessage('phone', getFieldValue('phone')) || errors.phone?.message}
                        onBlur={() => markFieldAsTouched('phone')}
                        onChange={(e) => {
                          registerUserForm('phone').onChange(e);
                          markFieldAsTouched('phone');
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Company Information */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{
                      color: '#1976d2',
                      fontWeight: '600',
                      borderBottom: '2px solid #e3f2fd',
                      pb: 1,
                      mb: 2
                    }}>
                      Company Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      {...registerUserForm('companyName', {
                        required: 'Company name is required'
                      })}
                      fullWidth
                      label="Company Name *"
                      error={!!errors.companyName || hasFieldError('companyName', getFieldValue('companyName'))}
                      helperText={getFieldErrorMessage('companyName', getFieldValue('companyName')) || errors.companyName?.message}
                      onBlur={() => markFieldAsTouched('companyName')}
                      onChange={(e) => {
                        registerUserForm('companyName').onChange(e);
                        markFieldAsTouched('companyName');
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      {...registerUserForm('companyAddress.street', {
                        required: 'Street address is required'
                      })}
                      fullWidth
                      label="Street Address *"
                      error={!!errors['companyAddress.street'] || hasFieldError('companyAddress.street', getFieldValue('companyAddress.street'))}
                      helperText={getFieldErrorMessage('companyAddress.street', getFieldValue('companyAddress.street')) || errors['companyAddress.street']?.message}
                      onBlur={() => markFieldAsTouched('companyAddress.street')}
                      onChange={(e) => {
                        registerUserForm('companyAddress.street').onChange(e);
                        markFieldAsTouched('companyAddress.street');
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      {...registerUserForm('companyAddress.city', {
                        required: 'City is required'
                      })}
                      fullWidth
                      label="City *"
                      error={!!errors['companyAddress.city'] || hasFieldError('companyAddress.city', getFieldValue('companyAddress.city'))}
                      helperText={getFieldErrorMessage('companyAddress.city', getFieldValue('companyAddress.city')) || errors['companyAddress.city']?.message}
                      onBlur={() => markFieldAsTouched('companyAddress.city')}
                      onChange={(e) => {
                        registerUserForm('companyAddress.city').onChange(e);
                        markFieldAsTouched('companyAddress.city');
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                                  <FormControl fullWidth error={!!errors['companyAddress.country'] || hasFieldError('companyAddress.country', getFieldValue('companyAddress.country'))}>
                    <InputLabel>Country *</InputLabel>
                    <Select
                      {...registerUserForm('companyAddress.country', {
                        required: 'Country is required'
                      })}
                      value={watch('companyAddress.country') || ''}
                      onChange={(e) => {
                        setValue('companyAddress.country', e.target.value);
                        markFieldAsTouched('companyAddress.country');
                        // Clear any existing errors for this field when a value is selected
                        if (e.target.value && e.target.value.trim() !== '') {
                          clearErrors('companyAddress.country');
                        }
                      }}
                      label="Country *"
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e0e0e0',
                          borderWidth: '1px'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                          borderWidth: '1px'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                          borderWidth: '2px'
                        }
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300
                          }
                        }
                      }}
                      renderValue={(selected) => {
                        const country = countries.find(c => c.name === selected);
                        return country ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CountryFlag countryCode={country.code} svg style={{ width: '1.2em', height: '1.2em' }} />
                            <Typography variant="body2">{country.name}</Typography>
                          </Box>
                        ) : selected;
                      }}
                    >
                    {countries.map((country) => (
                      <MenuItem 
                        key={country.code} 
                        value={country.name}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          minHeight: '40px',
                          py: 0.5,
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)'
                          }
                        }}
                      >
                        <CountryFlag countryCode={country.code} svg style={{ width: '1.2em', height: '1.2em' }} />
                        <Typography variant="body2">
                          {country.name}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                  {(errors['companyAddress.country'] || hasFieldError('companyAddress.country', getFieldValue('companyAddress.country'))) && (
                    <FormHelperText>{getFieldErrorMessage('companyAddress.country', getFieldValue('companyAddress.country')) || errors['companyAddress.country']?.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.buyerType || hasFieldError('buyerType', getFieldValue('buyerType'))}>
                  <InputLabel>Buyer Type *</InputLabel>
                  <Select
                    {...registerUserForm('buyerType', { 
                      required: 'Buyer type is required'
                    })}
                    value={watch('buyerType') || ''}
                    onChange={(e) => {
                      setValue('buyerType', e.target.value);
                      markFieldAsTouched('buyerType');
                      // Clear any existing errors for this field when a value is selected
                      if (e.target.value && e.target.value.trim() !== '') {
                        clearErrors('buyerType');
                      }
                    }}
                    label="Buyer Type *"
                  >
                    {buyerTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {(errors.buyerType || hasFieldError('buyerType', getFieldValue('buyerType'))) && (
                    <FormHelperText>{getFieldErrorMessage('buyerType', getFieldValue('buyerType')) || errors.buyerType?.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Security */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{
                  color: '#1976d2',
                  fontWeight: '600',
                  borderBottom: '2px solid #e3f2fd',
                  pb: 1,
                  mb: 2
                }}>
                  Security
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...registerUserForm('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  fullWidth
                  label="Password *"
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password || hasFieldError('password', getFieldValue('password'))}
                  helperText={getFieldErrorMessage('password', getFieldValue('password')) || errors.password?.message}
                  onBlur={() => markFieldAsTouched('password')}
                  onChange={(e) => {
                    registerUserForm('password').onChange(e);
                    markFieldAsTouched('password');
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    ),
                  }}
                />
                {watch('password') && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={passwordStrength} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 
                            passwordStrength < 50 ? '#f44336' :
                            passwordStrength < 75 ? '#ff9800' : '#4caf50'
                        }
                      }} 
                    />
                    <Typography variant="caption" color="text.secondary">
                      Password strength: {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                    </Typography>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...registerUserForm('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === watch('password') || 'Passwords do not match'
                  })}
                  fullWidth
                  label="Confirm Password *"
                  type={showConfirmPassword ? 'text' : 'password'}
                  error={!!errors.confirmPassword || hasFieldError('confirmPassword', getFieldValue('confirmPassword'))}
                  helperText={getFieldErrorMessage('confirmPassword', getFieldValue('confirmPassword')) || errors.confirmPassword?.message}
                  onBlur={() => markFieldAsTouched('confirmPassword')}
                  onChange={(e) => {
                    registerUserForm('confirmPassword').onChange(e);
                    markFieldAsTouched('confirmPassword');
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    ),
                  }}
                />
              </Grid>

              {/* Captcha */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{
                  color: '#1976d2',
                  fontWeight: '600',
                  borderBottom: '2px solid #e3f2fd',
                  pb: 1,
                  mb: 2
                }}>
                  Verification
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, maxWidth: '600px' }}>
                  <Box
                    sx={{
                      padding: '16px 24px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontFamily: 'monospace',
                      fontSize: '1.4rem',
                      fontWeight: 'bold',
                      letterSpacing: '0.3em',
                      userSelect: 'none',
                      minWidth: '160px',
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '56px',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                        animation: 'shimmer 2s infinite'
                      }
                    }}
                  >
                    {captchaCode}
                  </Box>
                  <IconButton 
                    onClick={handleRefreshCaptcha} 
                    color="primary" 
                    size="medium"
                    sx={{ 
                      backgroundColor: '#f8f9ff',
                      border: '2px solid #e3f2fd',
                      borderRadius: '10px',
                      width: '56px',
                      height: '56px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': { 
                        backgroundColor: '#e3f2fd',
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 8px rgba(33, 150, 243, 0.3)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <RefreshIcon sx={{ fontSize: '1.2rem' }} />
                  </IconButton>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: '220px', flex: 1, height: '80px', justifyContent: 'center' }}>
                    <TextField
                      size="medium"
                      label="Enter verification code *"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      error={formSubmitted && (!captchaInput || captchaInput.toUpperCase() !== captchaCode)}
                      helperText={formSubmitted && (!captchaInput || captchaInput.toUpperCase() !== captchaCode) ? 'Please enter the correct verification code' : ''}
                      sx={{ 
                        '& .MuiInputBase-root': {
                          fontSize: '1rem',
                          borderRadius: '8px',
                          backgroundColor: '#fafafa',
                          height: '56px',
                          '&:hover': {
                            backgroundColor: '#f5f5f5'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'white',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        },
                        '& .MuiFormHelperText-root': {
                          position: 'absolute',
                          bottom: '-20px',
                          margin: 0,
                          fontSize: '0.75rem'
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Terms of Service */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                    }}
                    style={{ marginTop: '4px' }}
                  />
                  <label htmlFor="acceptTerms" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                    By checking this box, you are agreeing to our terms of service
                  </label>
                </Box>
                {formSubmitted && !acceptTerms && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                    Please accept the terms of service to continue
                  </Typography>
                )}
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || isSubmitting}
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    borderRadius: '12px',
                    height: '56px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                      boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #bdbdbd 0%, #e0e0e0 100%)',
                      boxShadow: 'none'
                    },
                    transition: 'all 0.3s ease-in-out'
                  }}
                  data-testid="register-submit-btn"
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                      <span>Submitting...</span>
                    </Box>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" align="center">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" variant="body2">
                    Sign in
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  )}
</Box>
  );
}

export default Register; 