
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Image as ImageIcon, DollarSign, FileText, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const SellPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: '', model: '', year: '', mileage: '', vin: '', bodyStyle: '', engine: '', transmission: '',
    exteriorColor: '', interiorColor: '', photos: [], description: '', features: [], price: '',
    contactName: '', contactEmail: '', contactPhone: '', zipCode: '',
    titleDocument: null, registrationDocument: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFormData(prev => ({
          ...prev,
          contactName: user.user_metadata?.full_name || '',
          contactEmail: user.email || '',
        }));
      } else {
        toast({ title: "Authentication Error", description: "Please log in to sell a vehicle.", variant: "destructive" });
        navigate('/login');
      }
    };
    fetchUser();
  }, [toast, navigate]);

  const totalSteps = 4;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        features: checked ? [...prev.features, value] : prev.features.filter(f => f !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e, fieldName) => {
    if (fieldName === 'photos') {
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...Array.from(e.target.files)] }));
    } else {
      setFormData(prev => ({ ...prev, [fieldName]: e.target.files[0] }));
    }
  };

  const nextStep = () => currentStep < totalSteps && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const uploadFile = async (file, bucket, path) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to submit a listing.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    try {
      const photoUrls = [];
      for (const photo of formData.photos) {
        const photoPath = `vehicle_photos/${user.id}/${Date.now()}_${photo.name}`;
        const uploadedPath = await uploadFile(photo, 'vehicle-assets', photoPath); // Assume 'vehicle-assets' bucket
        photoUrls.push(supabase.storage.from('vehicle-assets').getPublicUrl(uploadedPath).data.publicUrl);
      }

      let titleDocUrl = null;
      if (formData.titleDocument) {
        const titlePath = `vehicle_documents/${user.id}/${Date.now()}_title_${formData.titleDocument.name}`;
        const uploadedPath = await uploadFile(formData.titleDocument, 'vehicle-assets', titlePath);
        titleDocUrl = supabase.storage.from('vehicle-assets').getPublicUrl(uploadedPath).data.publicUrl;
      }

      let regDocUrl = null;
      if (formData.registrationDocument) {
        const regPath = `vehicle_documents/${user.id}/${Date.now()}_registration_${formData.registrationDocument.name}`;
        const uploadedPath = await uploadFile(formData.registrationDocument, 'vehicle-assets', regPath);
        regDocUrl = supabase.storage.from('vehicle-assets').getPublicUrl(uploadedPath).data.publicUrl;
      }
      
      const listingData = {
        user_id: user.id,
        make: formData.make, model: formData.model, year: parseInt(formData.year), mileage: parseInt(formData.mileage),
        vin: formData.vin, body_style: formData.bodyStyle, engine: formData.engine, transmission: formData.transmission,
        exterior_color: formData.exteriorColor, interior_color: formData.interiorColor,
        photo_urls: photoUrls, description: formData.description, features: formData.features,
        price: parseFloat(formData.price),
        contact_name: formData.contactName, contact_email: formData.contactEmail, contact_phone: formData.contactPhone,
        zip_code: formData.zipCode,
        title_document_url: titleDocUrl,
        registration_document_url: regDocUrl,
        status: 'pending_verification', // Default status
      };

      const { error: insertError } = await supabase.from('listings').insert([listingData]);

      if (insertError) throw insertError;

      toast({
        title: "Listing Submitted! 🎉",
        description: "Your vehicle listing is under review. We'll notify you soon.",
      });
      setCurrentStep(1);
      setFormData({ /* Reset form */
        make: '', model: '', year: '', mileage: '', vin: '', bodyStyle: '', engine: '', transmission: '',
        exteriorColor: '', interiorColor: '', photos: [], description: '', features: [], price: '',
        contactName: user.user_metadata?.full_name || '', contactEmail: user.email || '', contactPhone: '', zipCode: '',
        titleDocument: null, registrationDocument: null,
      });
      
    } catch (error) {
      console.error("Error submitting listing:", error);
      toast({ title: "Submission Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {['Vehicle Details', 'Photos & Description', 'Contact & Price', 'Documents'].map((label, index) => (
          <div key={label} className={`text-sm ${index + 1 <= currentStep ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
            {label}
          </div>
        ))}
      </div>
      <div className="w-full bg-muted rounded-full h-2.5">
        <motion.div 
          className="bg-primary h-2.5 rounded-full"
          initial={{ width: `${((currentStep -1) / totalSteps) * 100}%`}}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-primary mb-2">Sell Your Vehicle</h1>
        <p className="text-lg text-muted-foreground">Follow these simple steps to list your car on Your2ndRide.</p>
      </motion.div>

      <div className="max-w-3xl mx-auto bg-card p-6 sm:p-8 rounded-xl shadow-2xl border">
        <ProgressBar />
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground flex items-center"><Car className="mr-2 text-primary"/>Vehicle Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><Label htmlFor="make">Make</Label><Input name="make" id="make" value={formData.make} onChange={handleInputChange} placeholder="e.g., Toyota" required /></div>
                  <div><Label htmlFor="model">Model</Label><Input name="model" id="model" value={formData.model} onChange={handleInputChange} placeholder="e.g., Camry" required /></div>
                  <div><Label htmlFor="year">Year</Label><Input type="number" name="year" id="year" value={formData.year} onChange={handleInputChange} placeholder="e.g., 2020" required /></div>
                  <div><Label htmlFor="mileage">Mileage</Label><Input type="number" name="mileage" id="mileage" value={formData.mileage} onChange={handleInputChange} placeholder="e.g., 30000" required /></div>
                  <div><Label htmlFor="vin">VIN</Label><Input name="vin" id="vin" value={formData.vin} onChange={handleInputChange} placeholder="Vehicle Identification Number" /></div>
                  <div><Label htmlFor="bodyStyle">Body Style</Label><Input name="bodyStyle" id="bodyStyle" value={formData.bodyStyle} onChange={handleInputChange} placeholder="e.g., Sedan, SUV" /></div>
                  <div><Label htmlFor="engine">Engine</Label><Input name="engine" id="engine" value={formData.engine} onChange={handleInputChange} placeholder="e.g., 2.5L 4-Cylinder" /></div>
                  <div><Label htmlFor="transmission">Transmission</Label><Input name="transmission" id="transmission" value={formData.transmission} onChange={handleInputChange} placeholder="e.g., Automatic, Manual" /></div>
                  <div><Label htmlFor="exteriorColor">Exterior Color</Label><Input name="exteriorColor" id="exteriorColor" value={formData.exteriorColor} onChange={handleInputChange} placeholder="e.g., Blue" /></div>
                  <div><Label htmlFor="interiorColor">Interior Color</Label><Input name="interiorColor" id="interiorColor" value={formData.interiorColor} onChange={handleInputChange} placeholder="e.g., Black" /></div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground flex items-center"><ImageIcon className="mr-2 text-primary"/>Photos & Description</h2>
                <div>
                  <Label htmlFor="photos">Upload Photos (select multiple, first will be primary)</Label>
                  <Input type="file" name="photos" id="photos" onChange={(e) => handleFileChange(e, 'photos')} multiple accept="image/*" />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.photos.map((file, index) => (
                      <div key={index} className="w-20 h-20 border rounded overflow-hidden">
                        <img  src={URL.createObjectURL(file)} alt={`Preview ${index+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea name="description" id="description" value={formData.description} onChange={handleInputChange} placeholder="Describe your vehicle, its condition, and history..." rows={5} required />
                </div>
                <div>
                  <Label>Features (select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                    {['Sunroof', 'Navigation', 'Leather Seats', 'Bluetooth', 'Backup Camera', 'Alloy Wheels'].map(feature => (
                      <div key={feature} className="flex items-center space-x-2">
                        <input type="checkbox" id={`feature-${feature}`} name="features" value={feature} checked={formData.features.includes(feature)} onChange={handleInputChange} className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
                        <Label htmlFor={`feature-${feature}`} className="font-normal">{feature}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground flex items-center"><DollarSign className="mr-2 text-primary"/>Contact & Price</h2>
                <div><Label htmlFor="price">Price ($)</Label><Input type="number" name="price" id="price" value={formData.price} onChange={handleInputChange} placeholder="e.g., 15000" required /></div>
                <div><Label htmlFor="contactName">Your Name</Label><Input name="contactName" id="contactName" value={formData.contactName} onChange={handleInputChange} placeholder="Full Name" required /></div>
                <div><Label htmlFor="contactEmail">Email</Label><Input type="email" name="contactEmail" id="contactEmail" value={formData.contactEmail} onChange={handleInputChange} placeholder="you@example.com" required /></div>
                <div><Label htmlFor="contactPhone">Phone Number</Label><Input type="tel" name="contactPhone" id="contactPhone" value={formData.contactPhone} onChange={handleInputChange} placeholder="(555) 123-4567" /></div>
                <div><Label htmlFor="zipCode">Zip Code</Label><Input name="zipCode" id="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="For local pickup" /></div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground flex items-center"><FileText className="mr-2 text-primary"/>Documents for Verification</h2>
                <p className="text-sm text-muted-foreground">To ensure legitimacy, please upload clear copies of the vehicle's title and registration. This information will be kept confidential and used for verification purposes only.</p>
                <div>
                  <Label htmlFor="titleDocument">Vehicle Title Document</Label>
                  <Input type="file" name="titleDocument" id="titleDocument" onChange={(e) => handleFileChange(e, 'titleDocument')} accept=".pdf,.jpg,.jpeg,.png" />
                  {formData.titleDocument && <p className="text-xs mt-1 text-green-600">Selected: {formData.titleDocument.name}</p>}
                </div>
                <div>
                  <Label htmlFor="registrationDocument">Vehicle Registration Document</Label>
                  <Input type="file" name="registrationDocument" id="registrationDocument" onChange={(e) => handleFileChange(e, 'registrationDocument')} accept=".pdf,.jpg,.jpeg,.png" />
                  {formData.registrationDocument && <p className="text-xs mt-1 text-green-600">Selected: {formData.registrationDocument.name}</p>}
                </div>
                <div className="flex items-start space-x-2 pt-2">
                  <input type="checkbox" id="termsAgree" name="termsAgree" required className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary mt-1" />
                  <Label htmlFor="termsAgree" className="font-normal text-sm">
                    I confirm that all information provided is accurate and I am the rightful owner or authorized to sell this vehicle. I agree to Your2ndRide's <Link to="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>.
                  </Label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 flex justify-between items-center">
            <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1 || isLoading}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep} disabled={isLoading}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700" disabled={isLoading}>
                {isLoading ? 'Submitting...' : (<>Submit Listing <CheckCircle className="ml-2 h-4 w-4" /></>)}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellPage;
