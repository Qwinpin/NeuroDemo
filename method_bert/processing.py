import torch
import transformers
import numpy as np

import types
import sys
sys.path.append("/neurodemo/stylized-neural-painting")


import loader


device = torch.device("cpu")

def processing(text):
    tokenizer = transformers.BertTokenizerFast.from_pretrained('bert-base-multilingual-cased', model_max_length=512).to(device)
    model = transformers.BertModel.from_pretrained('bert-base-multilingual-cased').to(device)
    
    inputs = tokenizer(text, return_tensors="pt")
    tokens = [tokenizer.decode(i) for i in inputs['input_ids'][0]]
    
    # get embeddings
    with torch.no_grad():
        tokens_embedding = model.embeddings.word_embeddings(inputs['input_ids'])[0].numpy()
        segment_embedding = model.embeddings.token_type_embeddings(inputs['token_type_ids'])[0].numpy()
        position_embedding = model.embeddings.position_embeddings(torch.arange(len(inputs['input_ids'][0])).expand((1, -1)))[0].numpy()
    
    # get hidden states and attention
    with torch.no_grad():
        outputs = model(**inputs, output_attentions=True, output_hidden_states=True)
    
    hidden_states = np.concatenate([i.numpy() for i in outputs['hidden_states'][1:]])
    embedding = outputs['hidden_states'][0].numpy()
    attentions = np.concatenate([i.numpy() for i in outputs['attentions']])
    
    return {
        'input_text': text,
        'tokens': tokens,
        'tokens_embedding': tokens_embedding.astype(np.float16),
        'segment_embedding': segment_embedding.astype(np.float16),
        'position_embedding': position_embedding.astype(np.float16),
        'resulting_embedding': embedding.astype(np.float16),
        'hidden_states': hidden_states.astype(np.float16),
        'attentions': attentions.astype(np.float16)
    }