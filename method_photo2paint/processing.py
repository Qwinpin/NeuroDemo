import torch
import torch.optim as optim
import torch.nn as nn
import torch.nn.functional as F

import argparse
import matplotlib.pyplot as plt
import types
import numpy as np
import cv2
import sys
sys.path.append("/neurodemo/stylized-neural-painting")

from painter import PainterBase, ProgressivePainter, utils, renderer
import morphology

import loader


device = torch.device("cpu")


class DCGAN_32(nn.Module):
    def __init__(self, rdrr, ngf=64):
        super(DCGAN_32, self).__init__()
        input_nc = rdrr.d
        self.out_size = 32

        self.convT2d_1 = nn.ConvTranspose2d(input_nc, ngf * 8, 4, 1, 0, bias=False)
        self.convT2d_2 = nn.ConvTranspose2d(ngf * 8, ngf * 4, 4, 2, 1, bias=False)
        self.convT2d_3 = nn.ConvTranspose2d(ngf * 4, ngf * 2, 4, 2, 1, bias=False)
        self.convT2d_4 = nn.ConvTranspose2d(ngf * 2, 6, 4, 2, 1, bias=False)

        self.batchnorm2d_1 = nn.BatchNorm2d(ngf * 8)
        self.batchnorm2d_2 = nn.BatchNorm2d(ngf * 4)
        self.batchnorm2d_3 = nn.BatchNorm2d(ngf * 2)

        self.relu = nn.ReLU(True)

        
    def forward(self, input):
        buffer = {}
        x = self.convT2d_1(input)
        x = self.batchnorm2d_1(x)
        x = self.relu(x)
        
        buffer[0] = x[0].detach().cpu().numpy().astype(np.float16).tolist()
        x = self.convT2d_2(x)
        x = self.batchnorm2d_2(x)
        x = self.relu(x)
        buffer[1] = x[0].detach().cpu().numpy().astype(np.float16).tolist()
        
        x = self.convT2d_3(x)
        x = self.batchnorm2d_3(x)
        x = self.relu(x)
        buffer[2] = x[0].detach().cpu().numpy().astype(np.float16).tolist()
        
        x = self.convT2d_4(x)
        buffer[3] = x[0].detach().cpu().numpy().astype(np.float16).tolist()

        return x[:,0:3,:,:], x[:,3:6,:,:], buffer
    
    
class PixelShuffleNet_32(nn.Module):
    def __init__(self, input_nc):
        super(PixelShuffleNet_32, self).__init__()
        self.fc1 = (nn.Linear(input_nc, 512))
        self.fc2 = (nn.Linear(512, 1024))
        self.fc3 = (nn.Linear(1024, 2048))

        self.conv1 = (nn.Conv2d(8, 64, 3, 1, 1))
        self.conv2 = (nn.Conv2d(64, 4*3, 3, 1, 1))

        self.pixel_shuffle = nn.PixelShuffle(2)

    def forward(self, x):
        buffer = {}
        x = x.squeeze()
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = F.relu(self.fc3(x))
        buffer[0] = x[0].detach().cpu().numpy().astype(np.float16).tolist()
        
        x = x.view(-1, 8, 16, 16)
        x = F.relu(self.conv1(x))
        buffer[1] = x[0].detach().cpu().numpy().astype(np.float16).tolist()
        
        x = self.pixel_shuffle(self.conv2(x))
        x = x.view(-1, 3, 32, 32)
        buffer[2] = x[0].detach().cpu().numpy().astype(np.float16).tolist()
        return x, buffer
    

class ZouFCNFusionLight(nn.Module):
    def __init__(self, rdrr):
        super(ZouFCNFusionLight, self).__init__()
        self.rdrr = rdrr
        self.out_size = 32
        self.huangnet = PixelShuffleNet_32(rdrr.d_shape)
        self.dcgan = DCGAN_32(rdrr)

    def forward(self, x):
        x_shape = x[:, 0:self.rdrr.d_shape, :, :]
        x_alpha = x[:, [-1], :, :]

        if self.rdrr.renderer in ['oilpaintbrush', 'airbrush']:
            x_alpha = torch.tensor(1.0).to(device)

        mask, buffer_huangnet = self.huangnet(x_shape)
        color, _, buffer_dcgan = self.dcgan(x)

        return color * mask, x_alpha * mask, {'pixelsuffle': buffer_huangnet, 'dcgan': buffer_dcgan}
    

ttt = torch.load('/neurodemo/stylized-neural-painting/checkpoints_G_watercolor_light/last_ckpt.pt', map_location=torch.device('cpu'))
layers_to_rename = {
    'dcgan.convT2d_1.weight': 'dcgan.main.0.weight',
    'dcgan.convT2d_2.weight': 'dcgan.main.3.weight',
    'dcgan.convT2d_3.weight': 'dcgan.main.6.weight',
    'dcgan.convT2d_4.weight': 'dcgan.main.9.weight',
    'dcgan.batchnorm2d_1.weight': 'dcgan.main.1.weight',
    'dcgan.batchnorm2d_1.bias': 'dcgan.main.1.bias',
    'dcgan.batchnorm2d_1.running_mean': 'dcgan.main.1.running_mean',
    'dcgan.batchnorm2d_1.running_var': 'dcgan.main.1.running_var',
    'dcgan.batchnorm2d_1.num_batches_tracked': 'dcgan.main.1.num_batches_tracked',
    'dcgan.batchnorm2d_2.weight': 'dcgan.main.4.weight',
    'dcgan.batchnorm2d_2.bias': 'dcgan.main.4.bias',
    'dcgan.batchnorm2d_2.running_mean': 'dcgan.main.4.running_mean',
    'dcgan.batchnorm2d_2.running_var': 'dcgan.main.4.running_var',
    'dcgan.batchnorm2d_2.num_batches_tracked': 'dcgan.main.4.num_batches_tracked',
    'dcgan.batchnorm2d_3.weight': 'dcgan.main.7.weight',
    'dcgan.batchnorm2d_3.bias': 'dcgan.main.7.bias',
    'dcgan.batchnorm2d_3.running_mean': 'dcgan.main.7.running_mean',
    'dcgan.batchnorm2d_3.running_var': 'dcgan.main.7.running_var',
    'dcgan.batchnorm2d_3.num_batches_tracked': 'dcgan.main.7.num_batches_tracked'
}

for new_key, old_key in layers_to_rename.items():
    ttt['model_G_state_dict'][new_key] = ttt['model_G_state_dict'].pop(old_key)
    
def _render(pt, renderer, v, save_jpgs=True, save_video=True):
    v = v[0,:,:]
    canvas_size = renderer.CANVAS_WIDTH
    if pt.args.keep_aspect_ratio:
        if pt.input_aspect_ratio < 1:
            out_h = int(canvas_size * pt.input_aspect_ratio)
            out_w = canvas_size
        else:
            out_h = canvas_size
            out_w = int(canvas_size / pt.input_aspect_ratio)
    else:
        out_h = canvas_size
        out_w = canvas_size

    renderer.create_empty_canvas()
    for i in range(v.shape[0]):  # for each stroke
        renderer.stroke_params = v[i, :]
        if renderer.check_stroke():
            renderer.draw_stroke()
        this_frame = renderer.canvas
        this_frame = cv2.resize(this_frame, (out_w, out_h), cv2.INTER_AREA)

    final_rendered_image = np.copy(this_frame)

    return final_rendered_image


def _forward_pass(self):
    self.x = torch.cat([self.x_ctt, self.x_color, self.x_alpha], dim=-1)

    v = torch.reshape(self.x[:, 0:self.anchor_id+1, :],
                      [self.m_grid*self.m_grid*(self.anchor_id+1), -1, 1, 1])
    self.G_pred_foregrounds, self.G_pred_alphas, buffer = self.net_G(v)

    self.G_pred_foregrounds = morphology.Dilation2d(m=1)(self.G_pred_foregrounds)
    self.G_pred_alphas = morphology.Erosion2d(m=1)(self.G_pred_alphas)

    self.G_pred_foregrounds = torch.reshape(
        self.G_pred_foregrounds, [self.m_grid*self.m_grid, self.anchor_id+1, 3,
                                  self.net_G.out_size, self.net_G.out_size])

    self.G_pred_alphas = torch.reshape(
        self.G_pred_alphas, [self.m_grid*self.m_grid, self.anchor_id+1, 3,
                             self.net_G.out_size, self.net_G.out_size])

    for i in range(self.anchor_id+1):
        G_pred_foreground = self.G_pred_foregrounds[:, i]
        G_pred_alpha = self.G_pred_alphas[:, i]
        self.G_pred_canvas = G_pred_foreground * G_pred_alpha \
                             + self.G_pred_canvas * (1 - G_pred_alpha)

    self.G_final_pred_canvas = self.G_pred_canvas
    
    return {'shape_before': self.x_ctt.detach().cpu().numpy().astype(np.float16).tolist(), 
            'color_before': self.x_color.detach().cpu().numpy().astype(np.float16).tolist(), 
            'alpha_before': self.x_alpha.detach().cpu().numpy().astype(np.float16).tolist()}, \
            {'states_before': buffer}

    
def _shuffle_strokes_and_reshape(pt, v):

    grid_idx = list(range(1 ** 2))
    # random.shuffle(grid_idx)
    v = v[grid_idx, :, :]
    v = np.reshape(np.transpose(v, [1,0,2]), [-1, pt.rderr.d])
    v = np.expand_dims(v, axis=0)

    return v


def _normalize_strokes(pt, v):

    v = np.array(v.detach().cpu())

    if pt.rderr.renderer in ['watercolor', 'markerpen']:
        # x0, y0, x1, y1, x2, y2, radius0, radius2, ...
        xs = np.array([0, 4])
        ys = np.array([1, 5])
        rs = np.array([6, 7])
    elif pt.rderr.renderer in ['oilpaintbrush', 'rectangle']:
        # xc, yc, w, h, theta ...
        xs = np.array([0])
        ys = np.array([1])
        rs = np.array([2, 3])
    else:
        raise NotImplementedError('renderer [%s] is not implemented' % pt.rderr.renderer)

    for y_id in range(1):
        for x_id in range(1):
            y_bias = y_id / 1
            x_bias = x_id / 1
            v[y_id * 1 + x_id, :, ys] = \
                y_bias + v[y_id * 1 + x_id, :, ys] / 1
            v[y_id * 1 + x_id, :, xs] = \
                x_bias + v[y_id * 1 + x_id, :, xs] / 1
            v[y_id * 1 + x_id, :, rs] /= 1

    return v


class ProgressivePainter(PainterBase):

    def __init__(self, args):
        super(ProgressivePainter, self).__init__(args=args)

        self.max_divide = args.max_divide

        self.max_m_strokes = args.max_m_strokes

        self.m_strokes_per_block = self.stroke_parser()

        self.m_grid = 1

#         self.img_path = args.img_path
        self.img_ = args.img
        self.img_path = args.img_path
        self.img_ = cv2.cvtColor(self.img_, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.
        self.input_aspect_ratio = self.img_.shape[0] / self.img_.shape[1]
        self.img_ = cv2.resize(self.img_, (self.net_G.out_size * args.max_divide,
                                           self.net_G.out_size * args.max_divide), cv2.INTER_AREA)


    def stroke_parser(self):

        total_blocks = 0
        for i in range(0, self.max_divide + 1):
            total_blocks += i ** 2

        return int(self.max_m_strokes / total_blocks)


    def _drawing_step_states(self):
        acc = self._compute_acc().item()
        print('iteration step %d, G_loss: %.5f, step_acc: %.5f, grid_scale: %d / %d, strokes: %d / %d'
              % (self.step_id, self.G_loss.item(), acc,
                 self.m_grid, self.max_divide,
                 self.anchor_id + 1, self.m_strokes_per_block))
        vis2 = utils.patches2img(self.G_final_pred_canvas, self.m_grid).clip(min=0, max=1)
        if self.args.disable_preview:
            pass
        else:
            cv2.namedWindow('G_pred', cv2.WINDOW_NORMAL)
            cv2.namedWindow('input', cv2.WINDOW_NORMAL)
            cv2.imshow('G_pred', vis2[:,:,::-1])
            cv2.imshow('input', self.img_[:, :, ::-1])
            cv2.waitKey(1)


def processing(image, num):
    data = loader.load(image)

    parser = argparse.ArgumentParser(description='STYLIZED NEURAL PAINTING')
    args = parser.parse_args(args=[])
    args.img = data # path to input photo
    args.img_path = '1.jpg' # path to input photo
    args.renderer = 'watercolor' # [watercolor, markerpen, oilpaintbrush, rectangle]
    args.canvas_color = 'black' # [black, white]
    args.canvas_size = 128 # size of the canvas for stroke rendering'
    args.keep_aspect_ratio = False # whether to keep input aspect ratio when saving outputs
    args.max_m_strokes = 200 # max number of strokes
    args.max_divide = 5 # divide an image up-to max_divide x max_divide patches
    args.beta_L1 = 1.0 # weight for L1 loss
    args.with_ot_loss = False # set True for imporving the convergence by using optimal transportation loss, but will slow-down the speed
    args.beta_ot = 0.1 # weight for optimal transportation loss
    args.net_G = 'zou-fusion-net-light' # renderer architecture
    args.renderer_checkpoint_dir = '/neurodemo/stylized-neural-painting/checkpoints_G_watercolor_light' # dir to load the pretrained neu-renderer
    args.lr = 0.005 # learning rate for stroke searching
    args.output_dir = './output' # dir to save painting results
    args.disable_preview = True # disable cv2.imshow, for running remotely without x-display
    
    
    pt = ProgressivePainter(args=args)
    pt._forward_pass = types.MethodType(_forward_pass, pt)

    net = ZouFCNFusionLight(pt.rderr)
    pt.net_G = net.to(device)

    strokes_renderer = renderer.Renderer(renderer=args.renderer,
                                           CANVAS_WIDTH=24, canvas_color=args.canvas_color)
    
    pt.net_G.load_state_dict(ttt['model_G_state_dict'])
    pt.net_G.eval()

    print('begin drawing...')

    history_params = np.zeros([1, 0, pt.rderr.d], np.float32)
    PARAMS = np.zeros([1, 0, pt.rderr.d], np.float32)

    if pt.rderr.canvas_color == 'white':
        CANVAS_tmp = torch.ones([4, 3, pt.net_G.out_size, pt.net_G.out_size]).to(device)
    else:
        CANVAS_tmp = torch.zeros([4, 3, pt.net_G.out_size, pt.net_G.out_size]).to(device)
        

    history = []
    pt.step_id = 0
    his_lim = 2
    for pt.m_grid in [1, 2, 3, 4, 5]:
        if len(history) >= his_lim:
            print(1)
            break
        pt.img_batch = utils.img2patches(pt.img_, pt.m_grid, pt.net_G.out_size).to(device)
        pt.G_final_pred_canvas = CANVAS_tmp

        pt.initialize_params()
        pt.x_ctt.requires_grad = True
        pt.x_color.requires_grad = True
        pt.x_alpha.requires_grad = True
        utils.set_requires_grad(pt.net_G, False)

        pt.optimizer_x = optim.RMSprop([pt.x_ctt, pt.x_color, pt.x_alpha], lr=pt.lr, centered=True)

        print(2)
        for pt.anchor_id in range(0, pt.m_strokes_per_block):
            if len(history) >= his_lim:
                break
            pt.stroke_sampler(pt.anchor_id)
            iters_per_stroke = int(500 / pt.m_strokes_per_block)
            # save_per_each = iters_per_stroke
            print(3)
            for i in range(iters_per_stroke):
                if len(history) >= his_lim:
                    break         

                pt.G_pred_canvas = CANVAS_tmp

                # update x
                pt.optimizer_x.zero_grad()

                pt.x_ctt.data = torch.clamp(pt.x_ctt.data, 0.1, 1 - 0.1)
                pt.x_color.data = torch.clamp(pt.x_color.data, 0, 1)
                pt.x_alpha.data = torch.clamp(pt.x_alpha.data, 0, 1)
                init_x = torch.cat([pt.x_ctt, pt.x_color, pt.x_alpha], dim=-1)

                stroke_parameters, states = pt._forward_pass()

                v1 = _normalize_strokes(pt, init_x)
                v1 = _shuffle_strokes_and_reshape(pt, v1)

                pt._drawing_step_states()
                pt._backward_x()

                pt.x_ctt.data = torch.clamp(pt.x_ctt.data, 0.1, 1 - 0.1)
                pt.x_color.data = torch.clamp(pt.x_color.data, 0, 1)
                pt.x_alpha.data = torch.clamp(pt.x_alpha.data, 0, 1)

                pt.optimizer_x.step()

                init_x = torch.cat([pt.x_ctt, pt.x_color, pt.x_alpha], dim=-1)
                v2 = _normalize_strokes(pt, init_x)
                v2 = _shuffle_strokes_and_reshape(pt, v2)

                # if pt.step_id % save_per_each == 0 and pt.step_id != 0:
                    
                pt.step_id += 1
            
            # if pt.step_id % save_per_each == 0 and pt.step_id != 0:
        step = {}
        step['grid'] = pt.m_grid
        step['step'] = pt.step_id
        step['stroke'] = pt.anchor_id
        
        strokes_before = [(_render(pt, strokes_renderer, v1[:pt.m_strokes_per_block, i:i+1, :], save_jpgs=False, save_video=False) * 255).astype(np.uint8).tolist() for i in range(v1.shape[1])]
        strokes_after = [(_render(pt, strokes_renderer, v2[:pt.m_strokes_per_block, i:i+1, :], save_jpgs=False, save_video=False) * 255).astype(np.uint8).tolist() for i in range(v2.shape[1])]

        step['strokes_before'] = strokes_before
        step['strokes_after'] = strokes_after
        step['states'] = states['states_before']

        step['shape_after'] = pt.x_ctt.detach().cpu().numpy().astype(np.float16).tolist()
        step['color_after'] = pt.x_color.detach().cpu().numpy().astype(np.float16).tolist()
        step['alpha_after'] = pt.x_alpha.detach().cpu().numpy().astype(np.float16).tolist()

        step['shape_before'] = stroke_parameters['shape_before']
        step['color_before'] = stroke_parameters['color_before']
        step['alpha_before'] = stroke_parameters['alpha_before']

        v = pt._normalize_strokes(pt.x)
        v = pt._shuffle_strokes_and_reshape(v)
        tmp_params = np.concatenate([history_params, v], axis=1)
        tmp_canvas = (_render(pt, pt.rderr, tmp_params, save_jpgs=False, save_video=False) * 255).astype(np.uint8)

        step['painting'] = tmp_canvas.tolist()
        history.append(step)

            

        print(4)
        v = pt._normalize_strokes(pt.x)
        v = pt._shuffle_strokes_and_reshape(v)
        PARAMS = np.concatenate([PARAMS, v], axis=1)
        history_params = np.concatenate([history_params, v], axis=1)
        CANVAS_tmp = pt._render(PARAMS, save_jpgs=False, save_video=False)
        CANVAS_tmp = utils.img2patches(CANVAS_tmp, pt.m_grid + 1, pt.net_G.out_size).to(device)
    #     print(CANVAS_tmp.shape)

#     pt._save_stroke_params(PARAMS)
#     final_rendered_image = pt._render(PARAMS, save_jpgs=False, save_video=True)
    return {
        'step': [i['step'] for i in history],
        'grid': [i['grid'] for i in history],
        'stroke_number': [i['stroke'] for i in history],
        'painting': [i['painting'] for i in history],
        'strokes_before': [i['strokes_before'] for i in history],
        'strokes_after': [i['strokes_after'] for i in history],
        'states': [i['states'] for i in history],
        'shape_before': [i['shape_before'] for i in history],
        'color_before': [i['color_before'] for i in history],
        'alpha_before': [i['alpha_before'] for i in history],
     }
    
    # return history