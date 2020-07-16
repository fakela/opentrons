// @flow
import * as React from 'react'
import {
  Box,
  Flex,
  PrimaryButton,
  Text,
  ALIGN_CENTER,
  ALIGN_FLEX_START,
  BORDER_SOLID_LIGHT,
  DIRECTION_COLUMN,
  FONT_SIZE_BODY_2,
  POSITION_RELATIVE,
  SPACING_2,
  SPACING_3,
  SPACING_4,
} from '@opentrons/components'

import { JogControls } from '../JogControls'
import type { JogAxis, JogDirection, JogStep } from '../../http-api-client'
import styles from './styles.css'
import type { CalibrateTipLengthChildProps } from './types'
import leftMultiBlockTipAsset from './videos/Left_Multi_CalBlock_Tip_REV1.webm'
import leftMultiTrashTipAsset from './videos/Left_Multi_Trash_Tip_REV1.webm'

const assetMap = {
  block: {
    left: {
      multi: leftMultiBlockTipAsset,
      single: leftMultiBlockTipAsset, // TODO: get asset for single pipettes
    },
    right: {
      multi: leftMultiBlockTipAsset,
      single: leftMultiBlockTipAsset, // TODO: get asset for single pipettes
    },
  },
  trash: {
    left: {
      multi: leftMultiTrashTipAsset,
      single: leftMultiTrashTipAsset, // TODO: get asset for single pipettes
    },
    right: {
      multi: leftMultiTrashTipAsset,
      single: leftMultiTrashTipAsset, // TODO: get asset for single pipettes
    },
  },
}

const HEADER = 'Save the tip length'
const JOG_UNTIL = 'Jog the robot until the tip is'
const BARELY_TOUCHING = 'barely touching (less than 0.1 mm)'
const THE = 'the'
const BLOCK = 'block in'
const FLAT_SURFACE = 'flat surface'
const OF_THE_TRASH_BIN = 'of the trash bin'
const SAVE_NOZZLE_Z_AXIS = 'Save the tip length'

export function MeasureTip(props: CalibrateTipLengthChildProps): React.Node {
  const { mount, hasBlock } = props
  // TODO: get real isMulti and mount and slotName from the session
  const isMulti = false
  const slotName = 'slot 3'

  const demoAsset = React.useMemo(
    () =>
      mount &&
      assetMap[hasBlock ? 'block' : 'trash'][mount][
        isMulti ? 'multi' : 'single'
      ],
    [mount, isMulti, hasBlock]
  )

  const jog = (axis: JogAxis, dir: JogDirection, step: JogStep) => {
    console.log('TODO: wire up jog with params', axis, dir, step)
    // props.sendSessionCommand('jog',{
    //   vector: formatJogVector(axis, direction, step),
    // }, {})
  }

  return (
    <>
      <Flex
        marginY={SPACING_2}
        flexDirection={DIRECTION_COLUMN}
        alignItems={ALIGN_FLEX_START}
        position={POSITION_RELATIVE}
        width="100%"
      >
        <h3 className={styles.intro_header}>{HEADER}</h3>
        <Box
          paddingX={SPACING_3}
          paddingY={SPACING_4}
          border={BORDER_SOLID_LIGHT}
          borderWidth="2px"
          width="100%"
        >
          <Flex alignItems={ALIGN_CENTER} width="100%">
            <Text width="49%" fontSize={FONT_SIZE_BODY_2}>
              {JOG_UNTIL}
              <b>&nbsp;{BARELY_TOUCHING}&nbsp;</b>
              {THE}
              &nbsp;
              {hasBlock ? BLOCK : <b>{FLAT_SURFACE}</b>}
              &nbsp;
              {hasBlock ? <b>{`${slotName}`}</b> : OF_THE_TRASH_BIN}
              &#46;
            </Text>
            <div className={styles.step_check_video_wrapper}>
              <video
                key={demoAsset}
                className={styles.step_check_video}
                autoPlay={true}
                loop={true}
                controls={false}
              >
                <source src={demoAsset} />
              </video>
            </div>
          </Flex>
        </Box>
        <div>
          <JogControls jog={jog} stepSizes={[0.1, 1]} axes={['z']} />
        </div>
        <Flex width="100%">
          <PrimaryButton
            onClick={() => {
              console.log('TODO: save nozzle offset')
            }}
            className={styles.command_button}
          >
            {SAVE_NOZZLE_Z_AXIS}
          </PrimaryButton>
        </Flex>
      </Flex>
    </>
  )
}
