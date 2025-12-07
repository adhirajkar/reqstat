import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Settings, FileJson, Database, Sparkles, Upload, X } from "lucide-react"
import { useReqStore } from '@/store/useReqStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const RequestTab = () => {
  const { 
    params, setParams, 
    headers, setHeaders, 
    bodyType, setBodyType,
    jsonBody, setJsonBody,
    formDataFields, setFormDataFields 
  } = useReqStore()

  const addParam = () => {
    setParams([...params, { key: '', value: '', enabled: true }])
  }

  const updateParam = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newParams = [...params]
    newParams[index] = { ...newParams[index], [field]: value }
    setParams(newParams)
  }

  const deleteParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index))
  }

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }])
  }

  const updateHeader = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newHeaders = [...headers]
    newHeaders[index] = { ...newHeaders[index], [field]: value }
    setHeaders(newHeaders)
  }

  const deleteHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const addFormDataField = () => {
    setFormDataFields([...formDataFields, { key: '', value: '', enabled: true, type: 'text', file: null }])
  }

  const updateFormDataField = (index: number, field: 'key' | 'value' | 'enabled' | 'type', value: string | boolean | 'text' | 'file') => {
    const newFields = [...formDataFields]
    if (field === 'type' && value === 'file') {
      newFields[index] = { ...newFields[index], [field]: value, value: '', file: null }
    } else if (field === 'type' && value === 'text') {
      newFields[index] = { ...newFields[index], [field]: value, file: null }
    } else {
      newFields[index] = { ...newFields[index], [field]: value }
    }
    setFormDataFields(newFields)
  }

  const updateFormDataFile = (index: number, file: File | null) => {
    const newFields = [...formDataFields]
    newFields[index] = { ...newFields[index], file, value: file?.name || '' }
    setFormDataFields(newFields)
  }

  const deleteFormDataField = (index: number) => {
    setFormDataFields(formDataFields.filter((_, i) => i !== index))
  }

  const enabledParamsCount = params.filter(p => p.enabled && p.key).length
  const enabledHeadersCount = headers.filter(h => h.enabled && h.key).length

  const clearAllParams = () => {
    setParams([])
    toast.success('All parameters cleared')
  }

  const clearAllHeaders = () => {
    setHeaders([])
    toast.success('All headers cleared')
  }

  const clearAllFormData = () => {
    setFormDataFields([])
    toast.success('All form fields cleared')
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonBody)
      setJsonBody(JSON.stringify(parsed, null, 2))
      toast.success('JSON formatted')
    } catch {
      toast.error('Invalid JSON')
    }
  }

  return (
    <Tabs defaultValue="params" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger className='cursor-pointer flex items-center gap-2' value="params">
          <Settings className="h-4 w-4" />
          Params
          {enabledParamsCount > 0 && (
            <Badge
              className="ml-1 h-5 min-w-5 rounded-full px-1.5 font-mono tabular-nums"
              variant="secondary"
            >
              {enabledParamsCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger className='cursor-pointer flex items-center gap-2' value="headers">
          <Database className="h-4 w-4" />
          Headers
          {enabledHeadersCount > 0 && (
            <Badge
              className="ml-1 h-5 min-w-5 rounded-full px-1.5 font-mono tabular-nums"
              variant="secondary"
            >
              {enabledHeadersCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger className='cursor-pointer flex items-center gap-2' value="body">
          <FileJson className="h-4 w-4" />
          Body
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="params" className="mt-4 space-y-3">
        {params.length > 0 && (
          <div className="flex items-center justify-between pb-2 border-b">
            <p className="text-sm text-muted-foreground">
              {params.length} parameter{params.length !== 1 ? 's' : ''} • {enabledParamsCount} enabled
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllParams}
              className="h-7 text-xs text-destructive hover:text-destructive"
            >
              Clear All
            </Button>
          </div>
        )}
        {params.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Settings className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No query parameters yet</p>
            <p className="text-xs text-muted-foreground/70">Add parameters to append to your URL</p>
          </div>
        ) : (
          <div className="space-y-2">
            {params.map((param, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <input
                  type="checkbox"
                  checked={param.enabled}
                  onChange={(e) => updateParam(index, 'enabled', e.target.checked)}
                  className="w-4 h-4 rounded border-input cursor-pointer"
                />
                <Input
                  placeholder="Key"
                  value={param.key}
                  onChange={(e) => updateParam(index, 'key', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={param.value}
                  onChange={(e) => updateParam(index, 'value', e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteParam(index)}
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={addParam}
          className="w-full mt-3"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Parameter
        </Button>
      </TabsContent>
      
      <TabsContent value="headers" className="mt-4 space-y-3">
        {headers.length > 0 && (
          <div className="flex items-center justify-between pb-2 border-b">
            <p className="text-sm text-muted-foreground">
              {headers.length} header{headers.length !== 1 ? 's' : ''} • {enabledHeadersCount} enabled
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllHeaders}
              className="h-7 text-xs text-destructive hover:text-destructive"
            >
              Clear All
            </Button>
          </div>
        )}
        {headers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Database className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No headers yet</p>
            <p className="text-xs text-muted-foreground/70">Add custom headers to your request</p>
          </div>
        ) : (
          <div className="space-y-2">
            {headers.map((header, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <input
                  type="checkbox"
                  checked={header.enabled}
                  onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                  className="w-4 h-4 rounded border-input cursor-pointer"
                />
                <Input
                  placeholder="Key"
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteHeader(index)}
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={addHeader}
          className="w-full mt-3"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Header
        </Button>
      </TabsContent>
      
      <TabsContent value="body" className="mt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Select value={bodyType} onValueChange={(value: 'none' | 'json' | 'form-data') => setBodyType(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select body type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="form-data">Form Data</SelectItem>
              </SelectContent>
            </Select>
            {bodyType === 'json' && jsonBody && (
              <Button
                variant="outline"
                size="sm"
                onClick={formatJson}
                className="h-8"
              >
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                Format JSON
              </Button>
            )}
          </div>

          {bodyType === 'none' && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileJson className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-1">No request body</p>
              <p className="text-xs text-muted-foreground/70">Select a body type to add data</p>
            </div>
          )}

          {bodyType === 'json' && (
            <div className="space-y-2">
              <Textarea
                placeholder='{\n  "key": "value"\n}'
                value={jsonBody}
                onChange={(e) => setJsonBody(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          )}

          {bodyType === 'form-data' && (
            <div className="space-y-3">
              {formDataFields.length > 0 && (
                <div className="flex items-center justify-between pb-2 border-b">
                  <p className="text-sm text-muted-foreground">
                    {formDataFields.length} field{formDataFields.length !== 1 ? 's' : ''}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFormData}
                    className="h-7 text-xs text-destructive hover:text-destructive"
                  >
                    Clear All
                  </Button>
                </div>
              )}
              {formDataFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Database className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">No form fields yet</p>
                  <p className="text-xs text-muted-foreground/70">Add fields to send as form data</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {formDataFields.map((field, index) => (
                    <div key={index} className="flex items-center gap-2 group">
                      <input
                        type="checkbox"
                        checked={field.enabled}
                        onChange={(e) => updateFormDataField(index, 'enabled', e.target.checked)}
                        className="w-4 h-4 rounded border-input cursor-pointer"
                      />
                      <Input
                        placeholder="Key"
                        value={field.key}
                        onChange={(e) => updateFormDataField(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      {field.type === 'text' ? (
                        <Input
                          placeholder="Value"
                          value={field.value}
                          onChange={(e) => updateFormDataField(index, 'value', e.target.value)}
                          className="flex-1"
                        />
                      ) : (
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 relative">
                            <Input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null
                                updateFormDataFile(index, file)
                              }}
                              className="cursor-pointer"
                            />
                          </div>
                          {field.file && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => updateFormDataFile(index, null)}
                              className="h-8 w-8"
                              title="Clear file"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                      <Select
                        value={field.type}
                        onValueChange={(value: 'text' | 'file') => updateFormDataField(index, 'type', value)}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="file">File</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteFormDataField(index)}
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={addFormDataField}
                className="w-full mt-3"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}

export default RequestTab