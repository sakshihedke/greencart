import React, {useEffect, useState} from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
//input field 
const InputField = ({type, placeholder, name, handleChange, address}) => (
    <input type={type} placeholder={placeholder} name={name} onChange={handleChange} value={address[name]} required className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition'/>
)

const AddAddress = () => {
  const {axios, user, navigate} = useAppContext();

  const [address, setAddress] = useState({firstName: "", lastName: "", email: "", street: "", city: "", state: "", zipCode: "", country: "", phone:"",});
    const handleChange = (e) => {
      const { name, value } = e.target;

      setAddress((prevAddress) => ({
        ...prevAddress,
        [name]: value,
      }));
      console.log({ [name]: value });
    };

  const onSubmitHandler = async(e)=>{
    e.preventDefault();
    try{
        const {data} = await axios.post('/api/address/add', {
              address: { ...address, userId: user._id }
});
        if(data.success){
          toast.success(data.message);
          navigate('/cart');
        }else{
          toast.error(data.message);
        }
    }catch(error){
      toast.error(error.message);
    }
  }
  useEffect(() => {
    if(!user){
      navigate('/cart')
    }
  },[])

  return (
    <div className='mt-16 pb-16'>
        <p className='text-2xl md:text-3xl text-gray-500'>Add Shipping <span className='font-semibold text-primary'>Address</span> </p>
        <div className='flex flex-col-reverse md:flex-row justify-between mt-10'>
            <div className='flex-1 max-w-md'>
                <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>
                  <div className='grid grid-cols-2 gap-4'>
                    <InputField handleChange={handleChange} address={address} placeholder='First Name' type='text' name='firstName'/>
                    <InputField handleChange={handleChange} address={address} placeholder='Last Name' type='text' name='lastName'/>
                  </div>
                  <InputField handleChange={handleChange} address={address} placeholder='Email Address' type='email' name='email'/>
                  <InputField handleChange={handleChange} address={address} placeholder='Street' type='text' name='street'/>

                  <div className='grid grid-cols-2 gap-4'>
                    <InputField handleChange={handleChange} address={address} placeholder='City' type='text' name='city'/>
                    <InputField handleChange={handleChange} address={address} placeholder='State' type='text' name='state'/>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <InputField handleChange={handleChange} address={address} placeholder='Zip code' type='number' name='zipcode'/>
                    <InputField handleChange={handleChange} address={address} placeholder='Country' type='text' name='country'/>
                  </div>

                  <InputField handleChange={handleChange} address={address} placeholder='Phone' type='number' name='phone'/>
                  <button type='submit' className='w-full mt-6 bg-primary text-white py-3 hover:bg-primary-dull transition cursor-pointer uppercase'>Save Address</button>
                </form>
            </div>
            <img className='md:mr-16 mb-16 md:mt-0' src={assets.add_address_iamge} alt="Add Adress" />
        </div>
    </div>
  )
}

export default AddAddress