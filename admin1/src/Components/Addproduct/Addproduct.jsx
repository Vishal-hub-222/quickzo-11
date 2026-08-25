import React, { useState } from 'react'
import "./Addproduct.css"
import upload_area from '../../Assets/upload_area.svg'
import { API_URL, getResponseData } from '../../api';

export const Addproduct = () => {
  const [image, setimage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [productDetails, setproductDetails] = useState({
    name: '',
    image: '',
    category: 'women',
    new_price: '',
    old_price: '',
    description: '',
  });

  const imagehandler = (e) => {
    setimage(e.target.files[0]);
    setFormError('');
  };

  const chengeHandler = (e) => {
    setproductDetails({ ...productDetails, [e.target.name]: e.target.value });
    if (e.target.name === 'description' || e.target.name === 'name') {
      setFormError('');
    }
  };

  const generateDescription = async () => {
    const name = productDetails.name.trim();
    const category = productDetails.category.trim();

    if (!name || !category) {
      setGenerationError('Enter a product name and category before generating a description.');
      return;
    }

    setGenerationError('');
    setIsGenerating(true);

    try {
      const response = await fetch(`${API_URL}/generate-product-description`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          category,
          new_price: productDetails.new_price,
          old_price: productDetails.old_price,
        }),
      });
      const data = await getResponseData(response);

      if (!data?.description) {
        throw new Error(data.message || 'Unable to generate a description.');
      }

      setproductDetails((currentDetails) => ({
        ...currentDetails,
        description: data.description,
      }));
      setFormError('');
    } catch (error) {
      setGenerationError(error.message || 'Unable to generate a description. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const Add_product = async () => {
    if (!productDetails.name.trim()) {
      setFormError('Enter a product name before saving.');
      return;
    }

    if (!image) {
      setFormError('Select a product image before saving.');
      return;
    }

    if (!productDetails.description.trim()) {
      setFormError('A product description is required before saving.');
      return;
    }

    setFormError('');
    setIsSaving(true);
    const product = { ...productDetails, description: productDetails.description.trim() };

    const formData = new FormData();
    formData.append('product', image);

    try {
      const uploadResponse = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });
      const responseData = await getResponseData(uploadResponse);

      if (!responseData?.success || !responseData.image_url) {
        throw new Error('The image upload did not return an image URL.');
      }

      product.image = responseData.image_url;
      const productResponse = await fetch(`${API_URL}/addproduct`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      const data = await getResponseData(productResponse);

      if (!data?.success) {
        throw new Error('The product could not be saved.');
      }

      alert('Product added');
      setproductDetails({ name: '', image: '', category: 'women', new_price: '', old_price: '', description: '' });
      setimage(false);
    } catch (error) {
      setFormError(error.message || 'Unable to connect to the product server.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="add-product">
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input type="text" value={productDetails.name} onChange={chengeHandler} name="name" placeholder="type here" />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input value={productDetails.old_price} onChange={chengeHandler} type="text" name="old_price" placeholder="type here" />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input value={productDetails.new_price} onChange={chengeHandler} type="text" name="new_price" placeholder="type here" />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select name="category" value={productDetails.category} onChange={chengeHandler} className="add-rpduct-selector">
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <div className="addproduct-description-header">
          <p>Product description</p>
          <button type="button" className="generate-description-btn" onClick={generateDescription} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
        <textarea
          value={productDetails.description}
          onChange={chengeHandler}
          name="description"
          placeholder="Generate a description or write one here"
          rows="5"
          aria-describedby="description-help"
        />
        <small id="description-help">Review and edit the generated description before saving.</small>
        {generationError && <p className="addproduct-error" role="alert">{generationError}</p>}
      </div>
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img src={image ? URL.createObjectURL(image) : upload_area} className="addproduct_thumnail_img" alt="Product upload preview" />
        </label>
        <input onChange={imagehandler} type="file" name="image" id="file-input" hidden />
      </div>
      {formError && <p className="addproduct-error" role="alert">{formError}</p>}
      <button type="button" onClick={Add_product} className="addproduct-btn" disabled={isSaving}>
        {isSaving ? 'SAVING...' : 'ADD'}
      </button>
    </div>
  );
};
