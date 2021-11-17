
// import react
import React from 'react';
import { Box, Divider, TextField, MenuItem } from '@dashup/ui';

// create page model config
const PageBulkEvents = (props = {}) => {

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
      name  : 'email',
      type  : 'email',
      help  : 'Email to field',
      label : 'Email To',
    },
    {
      name  : 'emailFrom',
      type  : 'email',
      help  : 'Email from field',
      label : 'Email From',
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
      return page.get('type') === 'model' && !page.get('archived');
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
      return page.get('type') === 'form' && page.get('data.model') === props.page.get('data.event.model') && !page.get('archived');
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
  
  // return jsx
  return (
    <>
      <TextField
        label="Event Model"
        value={ props.page.get('data.event.model') || '' }
        select
        onChange={ (e) => props.setData('event.model', e.target.value) }
        fullWidth
      >
        { getModels().map((option) => (
          <MenuItem key={ option.value } value={ option.value }>
            { option.label }
          </MenuItem>
        )) }
      </TextField>
      
      { !!props.page.get('data.event.model') && (
        <TextField
          label="Event Form(s)"
          value={ Array.isArray(props.page.get('data.event.form')) ? props.page.get('data.event.form') : [props.page.get('data.event.form')].filter((f) => f) }
          select
          onChange={ (e) => props.setData('event.form', e.target.value) }
          fullWidth
          SelectProps={ {
            multiple : true,
          } }
        >
          { getForm().map((option) => (
            <MenuItem key={ option.value } value={ option.value }>
              { option.label }
            </MenuItem>
          )) }
        </TextField>
      ) }

      { !!props.page.get('data.event.model') && !!props.page.get('data.event.form') && (
        <>
          <Box my={ 2 }>
            <Divider />
          </Box>
          
          { fields.map((field, i) => {
            // return jsx
            return (
              <TextField
                key={ `field-${field.name}` }
                label={ `${field.label} Field` }
                value={ props.page.get(`data.event.${field.name}`) || '' }
                select
                onChange={ (e) => props.setData(`event.${field.name}`, e.target.value) }
                fullWidth
                helpText={ field.help }
              >
                { getField(`event.${field.name}`, [field.type]).map((option) => (
                  <MenuItem key={ option.value } value={ option.value }>
                    { option.label }
                  </MenuItem>
                )) }
              </TextField>
            )
          }) }
        </>
      ) }
    </>
  )
};

// export default
export default PageBulkEvents;