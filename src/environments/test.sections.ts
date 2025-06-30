var template = {
	title: 'Test Wizard',
	sections: [
	  {
		title: 'Section 1',
		pages: [
		  {
			title: 'Simple Example',
			header: 'This is the simplest possible form but the field is required so that should stop the Next button',
			template: [
			  {
				key: 'Input',
				type: 'input',
				templateOptions: {
				  label: 'Input 1',
				  placeholder: 'Placeholder',
				  description: 'Description',
				  required: 'true'
				}
			  }
			]
		  },
		  {
			title: 'Complete Form',
			header: 'A more complete demo of a flat form, well stop here for flat forms and move on to grids',
			template: [
			  {
				fieldGroupClassName: 'row',
				fieldGroup: [
				  {
					className: 'col-6',
					type: 'input',
					key: 'firstName',
					templateOptions: {
					  label: 'First Name',
					  required: 'true'
					}
				  },
				  {
					className: 'col-6',
					type: 'input',
					key: 'lastName',
					templateOptions: {
					  label: 'Last Name',
					  required: 'true'
					},
					expressionProperties: {
					  'templateOptions.disabled': '!model.firstName'
					}
				  }
				]
			  },
			  {
				className: 'section-label',
				template: '<hr /><div><strong>Address:</strong></div>'
			  },
			  {
				fieldGroupClassName: 'row',
				fieldGroup: [
				  {
					className: 'col-6',
					type: 'input',
					key: 'street',
					templateOptions: {
					  label: 'Street'
					}
				  },
				  {
					className: 'col-3',
					type: 'input',
					key: 'cityName',
					templateOptions: {
					  label: 'City'
					}
				  },
				  {
					className: 'col-3',
					type: 'input',
					key: 'zip',
					templateOptions: {
					  type: 'number',
					  label: 'Zip',
					  max: 99999,
					  min: 0,
					  pattern: '\\d{5}'
					}
				  }
				]
			  },
			  {
				template: '<hr />'
			  },
			  {
				type: 'textarea',
				key: 'otherInput',
				templateOptions: {
				  label: 'Other Input'
				}
			  },
			  {
				type: 'checkbox',
				key: 'otherToo',
				templateOptions: {
				  label: 'Other Checkbox'
				}
			  }
			]
		  }
		]
	  },
	  {
		title: 'Section 2',
		pages: [
		  {
			title: 'Repeating Section',
			header: 'This is just a fieldArray with not object integration. Next well be trying ngx-datatable and ag-grid. Those are not going well. Well get there',
			template: [
			  {
				key: 'investments',
				type: 'repeat',
				templateOptions: {
				  addText: 'Add another investment'
				},
				fieldArray: {
				  fieldGroupClassName: 'row',
				  fieldGroup: [
					{
					  type: 'input',
					  key: 'investmentName1',
					  templateOptions: {
						header_label: 'ABC',
						required: true
					  }
					},
					{
					  type: 'select',
					  key: 'admin_user_id',
					  templateOptions: {
						header_label: 'Advisor',
						options: 'adminUsers$',
						valueProp: 'id',
						labelProp: 'name',
						required: true
					  }
					},
					{
					  type: 'select',
					  key: 'folder_id',
					  templateOptions: {
						header_label: 'Folder',
						options: 'folders$',
						valueProp: 'id',
						labelProp: 'name',
						required: true
					  }
					},
					{
					  type: 'select',
					  key: 'investmentName4',
					  templateOptions: {
						header_label: 'Expl Test',
						options: [
						  {
							value: 'a',
							label: 'A'
						  },
						  {
							value: 'b',
							label: 'B'
						  }
						],
						required: true
					  }
					},
					{
					  type: 'input',
					  key: 'investmentName5',
					  templateOptions: {
						header_label: 'ABC',
						required: true
					  }
					},
					{
					  type: 'input',
					  key: 'investmentName6',
					  templateOptions: {
						header_label: 'ABC',
						required: true
					  }
					},
					{
					  type: 'input',
					  key: 'investmentDate',
					  templateOptions: {
						type: 'date',
						header_label: 'Date of Investment:'
					  }
					},
					{
					  type: 'input',
					  key: 'stockIdentifier',
					  templateOptions: {
						header_label: 'Stock Identifier:',
						addonRight: {
						  'class': 'fa fa-trash',
						  onClick: 'remove(this)'
						}
					  }
					}
				  ]
				}
			  }
			]
		  },
		  {
			title: 'Datatable',
			header: 'This is ngx-datatable, so far not editable. Booooo',
			template: [
			  {
				className: 'section-label',
				template: '<h5>Personal data</h5>'
			  },
			  {
				fieldGroupClassName: 'row',
				fieldGroup: [
				  {
					key: 'name',
					type: 'input',
					className: 'col-md-6',
					templateOptions: {
					  label: 'Name',
					  required: true
					}
				  },
				  {
					key: 'surname',
					type: 'input',
					className: 'col-md-6',
					templateOptions: {
					  label: 'Surname',
					  required: true
					}
				  }
				]
			  },
			  {
				key: 'investments',
				type: 'datatable',
				templateOptions: {
				  columns: [
					{
					  name: 'Name of Investment',
					  prop: 'investmentName'
					},
					{
					  name: 'Date of Investment',
					  prop: 'investmentDate'
					},
					{
					  name: 'Stock Identifier',
					  prop: 'stockIdentifier'
					}
				  ]
				},
				fieldArray: {
				  fieldGroup: [
					{
					  type: 'input',
					  key: 'investmentName',
					  templateOptions: {
						required: true
					  }
					},
					{
					  type: 'input',
					  key: 'investmentDate',
					  templateOptions: {
						type: 'date'
					  }
					},
					{
					  type: 'input',
					  key: 'stockIdentifier',
					  templateOptions: {
						addonRight: {
						  'class': 'fa fa-code',
						  onClick: {}
						}
					  }
					}
				  ]
				}
			  }
			]
		  },
		  {
			title: 'AG Grid',
			template: [
			  {
				key: 'Input',
				type: 'input',
				templateOptions: {
				  label: 'Input 5',
				  placeholder: 'Placeholder',
				  description: 'Description',
				  required: 'true'
				}
			  }
			]
		  }
		]
	  }
	]
  }