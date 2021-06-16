
// import react
import React from 'react';
import Select from 'react-select';
import { View, Query } from '@dashup/ui';

// create page model config
const PagePhoneContacts = (props = {}) => {

  // fields
  const fields = [
    {
      name  : 'name',
      type  : 'text',
      label : 'Name'
    },
    {
      name  : 'email',
      type  : 'email',
      label : 'Email'
    },
    {
      name  : 'phone',
      type  : 'phone',
      label : 'Phone',
    }
  ];

  // get dashboards
  const getModels = () => {
    // get forms
    const models = Array.from(props.dashup.get('pages').values()).filter((page) => {
      // return model pages
      return page.get('type') === 'model';
    });

    // return mapped
    return models.map((model) => {
      // return values
      return {
        value : model.get('_id'),
        label : model.get('name'),

        selected : (props.page.get('data.model') || []).includes(model.get('_id')),
      };
    });
  };

  // get forms
  const getModals = () => {
    // get forms
    const forms = Array.from(props.dashup.get('pages').values()).filter((page) => {
      // return model pages
      return page.get('type') === 'form' && page.get('data.model') === props.page.get('data.model');
    });

    // return mapped
    return forms.map((form) => {
      // return values
      return {
        value : form.get('_id'),
        label : form.get('name'),

        selected : (props.page.get('data.modal') || []).includes(form.get('_id')),
      };
    });
  };

  // get forms
  const getForms = () => {
    // get forms
    const forms = Array.from(props.dashup.get('pages').values()).filter((page) => {
      // return model pages
      return page.get('type') === 'form' && page.get('data.model') === props.page.get('data.model');
    });

    // return mapped
    return forms.map((form) => {
      // return values
      return {
        value : form.get('_id'),
        label : form.get('name'),

        selected : (props.page.get('data.forms') || []).includes(form.get('_id')),
      };
    });
  };
  
  // get field
  const getField = (tld, types = []) => {
    // return value
    return props.getFields().map((field) => {
      // check type
      if (types.length && !types.includes(field.type)) return;

      // return fields
      return {
        label : field.label || field.name,
        value : field.uuid,

        selected : (props.page.get(`data.${tld}`) || []).includes(field.uuid),
      };
    }).filter((f) => f);
  };

  // on forms
  const onModel = (value) => {
    // set data
    props.setData('model', value?.value);
  };

  // on forms
  const onField = (tld, value) => {
    // set data
    props.setData(tld, value || null);
  };

  // on forms
  const onForms = (value) => {
    // set data
    props.setData('forms', value.map((v) => v.value));
  };

  // on forms
  const onModal = (value) => {
    // set data
    props.setData('modal', value?.value);
  };

  // return jsx
  return (
    <>
      <div className="mb-3">
        <label className="form-label">
          Contact Model
        </label>
        <Select options={ getModels() } defaultValue={ getModels().filter((f) => f.selected) } onChange={ onModel } isClearable />
      </div>
      
      { !!props.page.get('data.model') && (
        <>
          <div className="mb-3">
            <label className="form-label">
              Contact Form(s)
            </label>
            <Select options={ getForms() } defaultValue={ getForms().filter((f) => f.selected) } onChange={ onForms } isMulti />
          </div>
          <div className="mb-3">
            <label className="form-label">
              End Call Form
            </label>
            <Select options={ getModals() } defaultValue={ getModals().filter((f) => f.selected) } onChange={ onModal } />
            <small className="form-help">
              Form to display at the end of a call.
            </small>
          </div>
        </>
      ) }

      { !!props.page.get('data.model') && (
        <div className="mb-3">
          <label className="form-label">
            Grid Form(s)
          </label>
          <small>
            The forms that this grid will filter by.
          </small>
        </div>
      ) }

      { !!props.page.get('data.model') && props.getFields && !!props.getFields().length && (
        <>
          <hr />
          
          { fields.map((field, i) => {
            // return jsx
            return (
              <div className="mb-3" key={ `field-${field.name}` }>
                <label className="form-label">
                  { field.label } Field
                </label>
                <Select options={ getField(`field.${field.name}`, [field.type]) } defaultValue={ getField(`field.${field.name}`, [field.type]).filter((f) => f.selected) } onChange={ (value) => onField(`field.${field.name}`, value?.value) } />
              </div>
            )
          }) }
          
            
          <div className="mb-3">
            <label className="form-label">
              Tag Field(s)
            </label>
            <Select options={ getField('tag', ['select', 'checkbox']) } defaultValue={ getField('tag', ['select', 'checkbox']).filter((f) => f.selected) } onChange={ (value) => onField('tag', value.map((v) => v.value)) } isMulti />
            <small className="form-help">
              Selecting a tag field will allow you to tag tasks.
            </small>
          </div>
            
          <div className="mb-3">
            <label className="form-label">
              User Field(s)
            </label>
            <Select options={ getField('user', ['user']) } defaultValue={ getField('user', ['user']).filter((f) => f.selected) } onChange={ (value) => onField('user', value.map((v) => v.value)) } isMulti />
            <small className="form-help">
              Selecting a user field will allow you to assign tasks to that user.
            </small>
          </div>
            
          <div className="mb-3">
            <label className="form-label">
              Filter By
            </label>
            <Query dashup={ props.dashup } onChange={ console.log } />
          </div>
        </>
      ) }
    </>
  )
};

// export default
export default PagePhoneContacts;