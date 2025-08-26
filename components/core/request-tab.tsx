import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { useReqStore } from '@/store/useReqStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
    setFormDataFields([...formDataFields, { key: '', value: '', enabled: true }])
  }

  const updateFormDataField = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newFields = [...formDataFields]
    newFields[index] = { ...newFields[index], [field]: value }
    setFormDataFields(newFields)
  }

  const deleteFormDataField = (index: number) => {
    setFormDataFields(formDataFields.filter((_, i) => i !== index))
  }

  const enabledParamsCount = params.filter(p => p.enabled && p.key).length
  const enabledHeadersCount = headers.filter(h => h.enabled && h.key).length

  return (
    <Tabs defaultValue="params" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger className='cursor-pointer' value="params">
          Params
          {enabledParamsCount > 0 && (
            <Badge
              className="ml-2 h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
              variant="outline"
            >
              {enabledParamsCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger className='cursor-pointer' value="headers">
          Headers
          {enabledHeadersCount > 0 && (
            <Badge
              className="ml-2 h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
              variant="outline"
            >
              {enabledHeadersCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger className='cursor-pointer' value="body">Body</TabsTrigger>
      </TabsList>
      
      <TabsContent value="params" className="mt-4 space-y-2">
        {params.map((param, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={param.enabled}
              onChange={(e) => updateParam(index, 'enabled', e.target.checked)}
              className="w-4 h-4"
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
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addParam}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Parameter
        </Button>
      </TabsContent>
      
      <TabsContent value="headers" className="mt-4 space-y-2">
        {headers.map((header, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={header.enabled}
              onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
              className="w-4 h-4"
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
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addHeader}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Header
        </Button>
      </TabsContent>
      
      <TabsContent value="body" className="mt-4">
        <div className="space-y-4">
          <Select value={bodyType} onValueChange={(value: any) => setBodyType(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select body type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="form-data">Form Data</SelectItem>
            </SelectContent>
          </Select>
          
          {bodyType === 'json' && (
            <Textarea
              placeholder="Enter JSON body"
              value={jsonBody}
              onChange={(e) => setJsonBody(e.target.value)}
              className="min-h-[120px] font-mono text-sm"
            />
          )}
          
          {bodyType === 'form-data' && (
            <div className="space-y-2">
              {formDataFields.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.enabled}
                    onChange={(e) => updateFormDataField(index, 'enabled', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Input
                    placeholder="Key"
                    value={field.key}
                    onChange={(e) => updateFormDataField(index, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={field.value}
                    onChange={(e) => updateFormDataField(index, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteFormDataField(index)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addFormDataField}
                className="w-full"
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