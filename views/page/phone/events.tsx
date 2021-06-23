
// import react
import React from 'react';
import { Select } from '@dashup/ui';

// create page model config
const PagePhoneEvents = (props = {}) => {

  // fields
  const fields = [
    {
      name  : 'item',
      type  : 'model',
      help  : 'Model field referencing the contact',
      label : 'Task',
    },
    {
      name  : 'date',
      type  : 'date',
      help  : 'Date field for the call recording',
      label : 'Date',
    },
    {
      name  : 'to',
      type  : 'phone',
      help  : 'Phone field for the to number',
      label : 'Phone To',
    },
    {
      name  : 'from',
      type  : 'phone',
      help  : 'Phone field for the from number',
      label : 'Phone From',
    },
    {
      name  : 'title',
      type  : 'text',
      help  : 'Text field for the event title',
      label : 'Title'
    },
    {
      name  : 'type',
      type  : 'text',
      help  : 'Text field for the event type',
      label : 'Type'
    },
    {
      name  : 'body',
      type  : 'textarea',
      help  : 'Textarea field for the event content/body',
      label : 'Body',
    },
    {
      name  : 'user',
      type  : 'user',
      help  : 'User field for the calling user',
      label : 'User',
    },
    {
      name  : 'recording',
      type  : 'file',
      help  : 'File field for the call recording',
      label : 'Recording',
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

        selected : (props.page.get('data.event.model') || []).includes(model.get('_id')),
      };
    });
  };

  // get forms
  const getForm = () => {
    // get forms
    const forms = Array.from(props.dashup.get('pages').values()).filter((page) => {
      // return model pages
      return page.get('type') === 'form' && page.get('data.model') === props.page.get('data.event.model');
    });

    // return mapped
    return forms.map((form) => {
      // return values
      return {
        value : form.get('_id'),
        label : form.get('name'),

        selected : (props.page.get('data.event.form') || []).includes(form.get('_id')),
      };
    });
  };
  
  // get field
  const getField = (tld, types = []) => {
    // forms
    const forms = (props.page.get('data.event.form') ? [props.dashup.page(props.page.get('data.event.form'))] : []).filter((f) => f);

    // return value
    return props.getFields(forms).map((field) => {
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
    props.setData('event.model', value?.value);
  };

  // on forms
  const onField = (tld, value) => {
    // set data
    props.setData(tld, value || null);
  };

  // on forms
  const onForm = (value) => {
    // set data
    props.setData('event.form', value?.value);
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
      
      { !!props.page.get('data.event.model') && (
        <div className="mb-3">
          <label className="form-label">
            Contact Form(s)
          </label>
          <Select options={ getForm() } defaultValue={ getForm().filter((f) => f.selected) } onChange={ onForm } />
        </div>
      ) }

      { !!props.page.get('data.event.model') && !!props.page.get('data.event.form') && (
        <>
          <hr />
          
          { fields.map((field, i) => {
            // return jsx
            return (
              <div className="mb-3" key={ `event-${field.name}` }>
                <label className="form-label">
                  { field.label } Field
                </label>
                <Select options={ getField(`event.${field.name}`, [field.type]) } defaultValue={ getField(`event.${field.name}`, [field.type]).filter((f) => f.selected) } onChange={ (value) => onField(`event.${field.name}`, value?.value) } />
                { !!field.help && (
                  <small className="form-help">
                    { field.help }
                  </small>
                ) }
              </div>
            )
          }) }
        </>
      ) }
    </>
  )
};

// export default
export default PagePhoneEvents;