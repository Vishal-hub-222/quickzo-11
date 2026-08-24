import React, { useState } from 'react'
import "./Addproduct.css"
import upload_area from '../../Assets/upload_area.svg'

const BACKEND_URL = 'https://quickzo.onrender.com';

export const Addproduct = () => {
  const [image, setimage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [formError, setFormError] = useState('');

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
  };

  const chengeHandler = (e) => {
    setproductDetails({ ...productDetails, [e.target.name]: e.target.value });
    if (e.target.name === 'description') {
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
      const response = await fetch(`${BACKEND_URL}/generate-product-description`, {
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
      const data = await response.json();

      if (!response.ok || !data.description) {
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
    if (!productDetails.description.trim()) {
      setFormError('A product description is required before saving.');
      return;
    }

    setFormError('');
    let responseData;
    const product = { ...productDetails, description: productDetails.description.trim() };

    const formData = new FormData();
    formData.append('product', image);

    try {
      const uploadResponse = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });
      responseData = await uploadResponse.json();

      if (!uploadResponse.ok || !responseData.success) {
        throw new Error('Image upload failed.');
      }

      product.image = responseData.image_url;
      const productResponse = await fetch(`${BACKEND_URL}/addproduct`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      const data = await productResponse.json();

      if (!productResponse.ok || !data.success) {
        throw new Error(data.message || 'Unable to add the product.');
      }

      alert('Product added');
    } catch (error) {
      setFormError(error.message || 'Unable to add the product. Please try again.');
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
      <button type="button" onClick={Add_product} className="addproduct-btn">ADD</button>
    </div>
  );
};
